"""Builds the ``LLMProvider`` that ``LLM_PROVIDER`` selects."""

from app.application.ports.llm import LLMProvider, LLMRequest, LLMUnavailableError
from app.infrastructure.config import Settings
from app.infrastructure.llm.fake import FakeLLM
from app.infrastructure.llm.openai_compatible import OpenAICompatibleLLM


class UnconfiguredLLM:
    """Stands in when the selected provider has no credentials: every call fails cleanly."""

    def __init__(self, reason: str) -> None:
        self.reason = reason

    async def complete(self, request: LLMRequest) -> str:
        raise LLMUnavailableError(self.reason)


def build_llm_provider(settings: Settings) -> LLMProvider:
    timeout = settings.llm_timeout_seconds
    match settings.llm_provider:
        case "fake":
            return FakeLLM()
        case "azure":
            if not (settings.azure_openai_endpoint and settings.azure_openai_key):
                return UnconfiguredLLM("LLM_PROVIDER=azure needs AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY")
            return OpenAICompatibleLLM.azure(
                endpoint=settings.azure_openai_endpoint,
                api_key=settings.azure_openai_key,
                deployment=settings.azure_openai_deployment,
                api_version=settings.azure_openai_api_version,
                timeout=timeout,
            )
        case "groq":
            if not settings.llm_api_key:
                return UnconfiguredLLM("LLM_PROVIDER=groq needs LLM_API_KEY (free at console.groq.com)")
            return OpenAICompatibleLLM.groq(
                api_key=settings.llm_api_key,
                model=settings.llm_model,
                base_url=settings.llm_base_url,
                reasoning_effort=settings.llm_reasoning_effort or "low",
                timeout=timeout,
            )
        case "openai":
            if not settings.llm_api_key:
                return UnconfiguredLLM("LLM_PROVIDER=openai needs LLM_API_KEY")
            return OpenAICompatibleLLM.openai(
                api_key=settings.llm_api_key,
                model=settings.llm_model,
                base_url=settings.llm_base_url,
                reasoning_effort=settings.llm_reasoning_effort,
                timeout=timeout,
            )
