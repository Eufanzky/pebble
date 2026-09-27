"""An ``LLMProvider`` for any OpenAI-compatible chat-completions API.

It speaks plain HTTP through ``httpx`` rather than the ``openai`` SDK: one small
request covers Groq, OpenAI, Azure OpenAI and other compatible hosts, and respx can intercept it
in contract tests (the SDK's vendored HTTP client can't be intercepted).
"""

import logging

import httpx

from app.application.ports.llm import (
    LLMRateLimitedError,
    LLMRequest,
    LLMResponseError,
    LLMTimeoutError,
    LLMUnavailableError,
)

logger = logging.getLogger("pebble.llm")

GROQ_URL = "https://api.groq.com/openai/v1"
OPENAI_URL = "https://api.openai.com/v1"


class OpenAICompatibleLLM:
    def __init__(
        self,
        *,
        url: str,
        headers: dict[str, str],
        model: str | None,
        params: dict[str, str] | None = None,
        reasoning_effort: str = "",
        timeout: float = 30.0,
    ) -> None:
        self._url = url
        self._headers = headers
        self._model = model
        self._params = params or {}
        self._reasoning_effort = reasoning_effort
        self._timeout = timeout
        self._client = httpx.AsyncClient()

    @classmethod
    def groq(
        cls, *, api_key: str, model: str = "", base_url: str = "", reasoning_effort: str = "low", timeout: float = 30.0
    ):
        """Groq's free tier. gpt-oss models reason before answering; low effort keeps replies fast and small."""
        return cls(
            url=f"{(base_url or GROQ_URL).rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            model=model or "openai/gpt-oss-120b",
            reasoning_effort=reasoning_effort,
            timeout=timeout,
        )

    @classmethod
    def openai(
        cls, *, api_key: str, model: str = "", base_url: str = "", reasoning_effort: str = "", timeout: float = 30.0
    ):
        """OpenAI, or any OpenAI-compatible host through ``base_url``."""
        return cls(
            url=f"{(base_url or OPENAI_URL).rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            model=model or "gpt-4o",
            reasoning_effort=reasoning_effort,
            timeout=timeout,
        )

    @classmethod
    def azure(cls, *, endpoint: str, api_key: str, deployment: str, api_version: str, timeout: float = 30.0):
        return cls(
            url=f"{endpoint.rstrip('/')}/openai/deployments/{deployment}/chat/completions",
            headers={"api-key": api_key},
            model=None,  # the deployment picks the model
            params={"api-version": api_version},
            timeout=timeout,
        )

    async def complete(self, request: LLMRequest) -> str:
        payload: dict = {
            "messages": [
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.user_message},
            ],
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
        }
        if self._model:
            payload["model"] = self._model
        if request.json_mode:
            payload["response_format"] = {"type": "json_object"}
        if self._reasoning_effort:
            payload["reasoning_effort"] = self._reasoning_effort

        try:
            response = await self._client.post(
                self._url, json=payload, headers=self._headers, params=self._params, timeout=self._timeout
            )
        except httpx.TimeoutException as e:
            raise LLMTimeoutError(f"{request.agent}: the LLM didn't answer within {self._timeout}s") from e
        except httpx.HTTPError as e:
            raise LLMUnavailableError(f"{request.agent}: can't reach the LLM ({type(e).__name__})") from e

        if response.status_code == 429:
            raise LLMRateLimitedError(retry_after=_retry_after(response))
        if response.status_code == 400 and _error_code(response) == "json_validate_failed":
            # JSON mode: the model's reply wasn't valid JSON (Groq, OpenAI). The reply is unusable, the host is fine.
            raise LLMResponseError(f"{request.agent}: the LLM's reply wasn't valid JSON")
        if response.status_code >= 400:
            code = _error_code(response)
            logger.warning("LLM call for %s failed with HTTP %s (%s)", request.agent, response.status_code, code)
            raise LLMUnavailableError(f"{request.agent}: the LLM returned HTTP {response.status_code} ({code})")

        try:
            content = response.json()["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as e:
            raise LLMResponseError(
                f"{request.agent}: the LLM response isn't a chat completion ({_describe(response)})"
            ) from e
        if not isinstance(content, str):
            raise LLMResponseError(f"{request.agent}: the LLM returned no text ({_describe(response)})")
        return content

    async def aclose(self) -> None:
        await self._client.aclose()


def _retry_after(response: httpx.Response) -> float | None:
    try:
        return float(response.headers["retry-after"])
    except (KeyError, ValueError):
        return None


def _describe(response: httpx.Response) -> str:
    """The response's shape for error messages: never its content, which may echo the user's text."""
    parts = [f"HTTP {response.status_code}", response.headers.get("content-type", "no content-type")]
    try:
        body = response.json()
    except ValueError:
        return ", ".join([*parts, f"{len(response.content)} bytes, not JSON"])
    if isinstance(body, dict):
        parts.append(f"keys {sorted(body)[:10]}")
        choices = body.get("choices")
        if isinstance(choices, list) and choices and isinstance(choices[0], dict):
            parts.append(f"finish_reason {choices[0].get('finish_reason')!r}")
    else:
        parts.append(f"JSON {type(body).__name__}")
    return ", ".join(parts)


def _error_code(response: httpx.Response) -> str | None:
    """The error ``code`` (or ``type``) from an OpenAI-style error body. Never the message, which may echo input."""
    try:
        error = response.json().get("error")
    except (ValueError, AttributeError):
        return None
    if not isinstance(error, dict):
        return None
    code = error.get("code") or error.get("type")
    return str(code) if code else None
