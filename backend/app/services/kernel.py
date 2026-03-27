import logging

from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion

from app.config import settings

logger = logging.getLogger("focusbuddy.kernel")

_kernel: Kernel | None = None


def get_kernel() -> Kernel:
    """Get the Semantic Kernel singleton with Azure OpenAI."""
    global _kernel
    if _kernel is None:
        _kernel = Kernel()
        _kernel.add_service(
            AzureChatCompletion(
                deployment_name=settings.azure_openai_deployment,
                endpoint=settings.azure_openai_endpoint,
                api_key=settings.azure_openai_key,
                api_version=settings.azure_openai_api_version,
            )
        )
        logger.info("Semantic Kernel initialized with Azure OpenAI")
    return _kernel
