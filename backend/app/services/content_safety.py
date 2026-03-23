from azure.ai.contentsafety.aio import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions, TextCategory
from azure.core.credentials import AzureKeyCredential

from app.config import settings

_client: ContentSafetyClient | None = None

# Severity threshold (0-6). Reject content at or above this level.
SEVERITY_THRESHOLD = 2


def _get_client() -> ContentSafetyClient:
    """Get the Content Safety async client (singleton)."""
    global _client
    if _client is None:
        _client = ContentSafetyClient(
            endpoint=settings.content_safety_endpoint,
            credential=AzureKeyCredential(settings.content_safety_key),
        )
    return _client


async def check_text_safety(text: str) -> dict:
    """
    Analyze text for harmful content.

    Returns:
        {
            "safe": bool,
            "categories": {
                "Hate": int,
                "SelfHarm": int,
                "Sexual": int,
                "Violence": int,
            }
        }
    """
    if not settings.content_safety_endpoint or not settings.content_safety_key:
        # Skip safety check if not configured (dev mode)
        return {"safe": True, "categories": {}}

    client = _get_client()
    request = AnalyzeTextOptions(
        text=text,
        categories=[
            TextCategory.HATE,
            TextCategory.SELF_HARM,
            TextCategory.SEXUAL,
            TextCategory.VIOLENCE,
        ],
    )

    response = await client.analyze_text(request)

    categories = {}
    is_safe = True
    for result in response.categories_analysis:
        severity = result.severity or 0
        categories[result.category] = severity
        if severity >= SEVERITY_THRESHOLD:
            is_safe = False

    return {"safe": is_safe, "categories": categories}


async def ensure_safe(text: str) -> str:
    """
    Check text safety and return the text if safe.
    Raises ValueError if content is flagged.
    """
    result = await check_text_safety(text)
    if not result["safe"]:
        raise ValueError(
            "Content flagged by safety filter. "
            "Pebble can only provide safe, supportive responses."
        )
    return text
