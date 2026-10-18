"""``LLM_PROVIDER`` selects the adapter; a missing key disables the LLM cleanly."""

import json

import httpx
import pytest
import respx

from app.application.ports.llm import LLMRequest, LLMUnavailableError
from app.infrastructure.config import Settings
from app.infrastructure.llm.factory import UnconfiguredLLM, build_llm_provider
from app.infrastructure.llm.fake import FakeLLM
from app.infrastructure.llm.openai_compatible import OpenAICompatibleLLM


def settings(**values) -> Settings:
    return Settings(_env_file=None, **values)


def test_fake():
    assert isinstance(build_llm_provider(settings(llm_provider="fake")), FakeLLM)


@pytest.mark.parametrize("provider", ["groq", "openai"])
def test_key_based_providers(provider):
    llm = build_llm_provider(settings(llm_provider=provider, llm_api_key="key"))

    assert isinstance(llm, OpenAICompatibleLLM)


def test_azure():
    llm = build_llm_provider(
        settings(llm_provider="azure", azure_openai_endpoint="https://x.openai.azure.com", azure_openai_key="k")
    )

    assert isinstance(llm, OpenAICompatibleLLM)


def test_groq_is_the_default():
    assert settings().llm_provider == "groq"


def test_github_models_is_retired():
    with pytest.raises(ValueError):
        settings(llm_provider="github")


@pytest.mark.parametrize(
    ("values", "reason"),
    [
        ({"llm_provider": "groq"}, "console.groq.com"),
        ({"llm_provider": "openai"}, "LLM_API_KEY"),
        ({"llm_provider": "azure"}, "AZURE_OPENAI_ENDPOINT"),
    ],
)
async def test_missing_credentials_give_an_llm_that_fails_cleanly(values, reason):
    llm = build_llm_provider(settings(**values))

    assert isinstance(llm, UnconfiguredLLM)
    with pytest.raises(LLMUnavailableError, match=reason):
        await llm.complete(LLMRequest(agent="orchestrator", system_prompt="s", user_message="u"))


def test_unknown_provider_is_rejected_at_startup():
    with pytest.raises(ValueError):
        settings(llm_provider="banana")


async def sent_reasoning_effort(llm, url: str) -> str | None:
    """The ``reasoning_effort`` the adapter sends with one request."""
    reply = {"choices": [{"message": {"content": "{}"}}]}
    with respx.mock:
        route = respx.post(url).mock(return_value=httpx.Response(200, json=reply))
        await llm.complete(LLMRequest(agent="orchestrator", system_prompt="s", user_message="u"))
    return json.loads(route.calls.last.request.content).get("reasoning_effort")


@pytest.mark.parametrize(
    ("values", "url", "effort"),
    [
        # A-037: Groq reached as an OpenAI-compatible host reasons briefly too, so replies aren't cut short
        ({"llm_provider": "groq"}, "https://api.groq.com/openai/v1/chat/completions", "low"),
        (
            {"llm_provider": "openai", "llm_base_url": "https://api.groq.com/openai/v1/"},
            "https://api.groq.com/openai/v1/chat/completions",
            "low",
        ),
        ({"llm_provider": "openai"}, "https://api.openai.com/v1/chat/completions", None),
        (
            {
                "llm_provider": "openai",
                "llm_base_url": "https://api.groq.com/openai/v1",
                "llm_reasoning_effort": "high",
            },
            "https://api.groq.com/openai/v1/chat/completions",
            "high",
        ),
    ],
)
async def test_reasoning_effort(values, url, effort):
    llm = build_llm_provider(settings(llm_api_key="key", **values))

    assert await sent_reasoning_effort(llm, url) == effort
