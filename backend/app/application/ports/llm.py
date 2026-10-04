"""The LLM port: one chat completion in, the model's text out."""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class LLMRequest:
    agent: str
    """Who is asking: ``orchestrator``, or an agent's name (``CalmSense``, ``SimplifyCore``, ``PebbleVoice``).
    Used for logs and by the fake LLM, which tests script per agent."""
    system_prompt: str
    user_message: str
    temperature: float = 0.7
    max_tokens: int = 1024
    json_mode: bool = True
    """Ask the model for a JSON object."""


class LLMProvider(Protocol):
    async def complete(self, request: LLMRequest) -> str:
        """Return the model's reply text. Raises an ``LLMError`` subclass on failure."""
        ...


class LLMError(Exception):
    """The LLM could not produce a reply."""


class LLMUnavailableError(LLMError):
    """The provider can't be reached, isn't configured, or failed (5xx, auth)."""


class LLMTimeoutError(LLMUnavailableError):
    """The provider didn't answer in time."""


class LLMRateLimitedError(LLMError):
    """The provider's rate limit was hit (HTTP 429)."""

    def __init__(self, message: str = "LLM rate limit reached", retry_after: float | None = None) -> None:
        super().__init__(message)
        self.retry_after = retry_after


class LLMResponseError(LLMError):
    """The provider answered, but not with a usable chat completion."""
