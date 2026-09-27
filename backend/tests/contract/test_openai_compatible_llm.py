"""Contract tests for the OpenAI-compatible LLM adapter, against recorded-shape responses (respx)."""

import json
import re

import httpx
import pytest
import respx

from app.application.ports.llm import (
    LLMRateLimitedError,
    LLMRequest,
    LLMResponseError,
    LLMTimeoutError,
    LLMUnavailableError,
)
from app.infrastructure.llm.openai_compatible import OpenAICompatibleLLM

GITHUB_URL = "https://models.github.ai/inference/chat/completions"
REQUEST = LLMRequest(
    agent="orchestrator", system_prompt="You are Pebble.", user_message="Hi", temperature=0.6, max_tokens=512
)


def completion(content: str | None) -> dict:
    """The shape of a chat-completions response, trimmed to what the adapter reads plus typical extras."""
    return {
        "id": "chatcmpl-1",
        "object": "chat.completion",
        "model": "gpt-4o",
        "choices": [{"index": 0, "finish_reason": "stop", "message": {"role": "assistant", "content": content}}],
        "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15},
    }


@pytest.fixture
def github() -> OpenAICompatibleLLM:
    return OpenAICompatibleLLM.github_models(api_key="gh-token")


@respx.mock
async def test_success_returns_the_message_text(github):
    route = respx.post(GITHUB_URL).respond(json=completion('{"intent": "chat"}'))

    assert await github.complete(REQUEST) == '{"intent": "chat"}'

    sent = route.calls.last.request
    assert sent.headers["authorization"] == "Bearer gh-token"
    assert json.loads(sent.content) == {
        "model": "openai/gpt-4o",
        "messages": [
            {"role": "system", "content": "You are Pebble."},
            {"role": "user", "content": "Hi"},
        ],
        "temperature": 0.6,
        "max_tokens": 512,
        "response_format": {"type": "json_object"},
    }


@respx.mock
async def test_json_mode_off_sends_no_response_format(github):
    route = respx.post(GITHUB_URL).respond(json=completion("plain"))

    await github.complete(LLMRequest(agent="x", system_prompt="s", user_message="u", json_mode=False))

    assert "response_format" not in json.loads(route.calls.last.request.content)


@respx.mock
async def test_azure_uses_the_deployment_url_api_key_and_version():
    llm = OpenAICompatibleLLM.azure(
        endpoint="https://pebble.openai.azure.com/", api_key="az-key", deployment="gpt-4o", api_version="2024-12-01"
    )
    route = respx.post("https://pebble.openai.azure.com/openai/deployments/gpt-4o/chat/completions").respond(
        json=completion("ok")
    )

    assert await llm.complete(REQUEST) == "ok"

    sent = route.calls.last.request
    assert sent.headers["api-key"] == "az-key"
    assert "authorization" not in sent.headers
    assert sent.url.params["api-version"] == "2024-12-01"
    assert "model" not in json.loads(sent.content)


@respx.mock
async def test_openai_uses_its_endpoint_and_a_custom_model():
    llm = OpenAICompatibleLLM.openai(api_key="sk", model="gpt-4o-mini")
    route = respx.post("https://api.openai.com/v1/chat/completions").respond(json=completion("ok"))

    await llm.complete(REQUEST)

    assert json.loads(route.calls.last.request.content)["model"] == "gpt-4o-mini"


@respx.mock
@pytest.mark.parametrize(
    "response",
    [
        httpx.Response(200, text="<html>Bad gateway</html>"),
        httpx.Response(200, json={"error": "nope"}),
        httpx.Response(200, json={"choices": []}),
        httpx.Response(200, json=completion(None)),
    ],
    ids=["not-json", "no-choices-key", "empty-choices", "null-content"],
)
async def test_malformed_response_is_a_response_error(github, response):
    respx.post(GITHUB_URL).mock(return_value=response)

    with pytest.raises(LLMResponseError):
        await github.complete(REQUEST)


@respx.mock
async def test_429_is_rate_limited_with_retry_after(github):
    respx.post(GITHUB_URL).respond(429, headers={"retry-after": "42"}, json={"error": {"code": "RateLimitReached"}})

    with pytest.raises(LLMRateLimitedError) as caught:
        await github.complete(REQUEST)

    assert caught.value.retry_after == 42.0


@respx.mock
async def test_429_without_retry_after(github):
    respx.post(GITHUB_URL).respond(429)

    with pytest.raises(LLMRateLimitedError) as caught:
        await github.complete(REQUEST)

    assert caught.value.retry_after is None


@respx.mock
async def test_timeout_is_a_timeout_error(github):
    respx.post(GITHUB_URL).mock(side_effect=httpx.ReadTimeout("slow"))

    with pytest.raises(LLMTimeoutError):
        await github.complete(REQUEST)


@respx.mock
async def test_timeout_counts_as_unavailable(github):
    respx.post(GITHUB_URL).mock(side_effect=httpx.ConnectTimeout("slow"))

    with pytest.raises(LLMUnavailableError):
        await github.complete(REQUEST)


@respx.mock
async def test_connection_error_is_unavailable(github):
    respx.post(GITHUB_URL).mock(side_effect=httpx.ConnectError("refused"))

    with pytest.raises(LLMUnavailableError):
        await github.complete(REQUEST)


@respx.mock
@pytest.mark.parametrize("status", [401, 403, 500, 503])
async def test_http_errors_are_unavailable(github, status):
    respx.post(GITHUB_URL).respond(status)

    with pytest.raises(LLMUnavailableError, match=f"HTTP {status}"):
        await github.complete(REQUEST)


async def test_the_client_can_be_closed(github):
    await github.aclose()


@respx.mock
@pytest.mark.parametrize(
    ("response", "described"),
    [
        (
            httpx.Response(200, text="OK", headers={"content-type": "text/plain"}),
            "HTTP 200, text/plain, 2 bytes, not JSON",
        ),
        (httpx.Response(200, json={"error": "x", "id": "1"}), "HTTP 200, application/json, keys ['error', 'id']"),
        (
            httpx.Response(200, json={"choices": [{"finish_reason": "content_filter", "message": {}}]}),
            "finish_reason 'content_filter'",
        ),
    ],
)
async def test_response_errors_describe_the_shape_but_never_the_content(github, response, described):
    respx.post(GITHUB_URL).mock(return_value=response)

    with pytest.raises(LLMResponseError, match=re.escape(described)):
        await github.complete(REQUEST)
