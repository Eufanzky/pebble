import logging

import httpx
from azure.ai.contentsafety.aio import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions, TextCategory
from azure.core.credentials import AzureKeyCredential

from app.config import settings

logger = logging.getLogger("focusbuddy.safety")

_client: ContentSafetyClient | None = None

# Severity threshold (0-6). Reject content at or above this level.
SEVERITY_THRESHOLD = 2


def _is_configured() -> bool:
    return bool(settings.content_safety_endpoint and settings.content_safety_key)


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
    if not _is_configured():
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


# ---------------------------------------------------------------------------
# Prompt Shields — detect jailbreak / prompt injection attacks
# ---------------------------------------------------------------------------

async def check_prompt_shield(
    user_prompt: str,
    documents: list[str] | None = None,
) -> dict:
    """
    Detect prompt injection attacks in user input and embedded documents.

    Uses the Prompt Shields API (api-version=2024-09-01).

    Returns:
        {
            "attackDetected": bool,
            "userPromptAttack": bool,
            "documentAttack": bool,
        }
    """
    if not _is_configured():
        return {"attackDetected": False, "userPromptAttack": False, "documentAttack": False}

    url = f"{settings.content_safety_endpoint}/contentsafety/text:shieldPrompt"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.content_safety_key,
        "Content-Type": "application/json",
    }
    payload = {
        "userPrompt": user_prompt,
        "documents": documents or [],
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                headers=headers,
                json=payload,
                params={"api-version": "2024-09-01"},
                timeout=10.0,
            )
            resp.raise_for_status()
            data = resp.json()

        user_attack = data.get("userPromptAnalysis", {}).get("attackDetected", False)
        doc_attack = any(
            d.get("attackDetected", False)
            for d in data.get("documentsAnalysis", [])
        )
        return {
            "attackDetected": user_attack or doc_attack,
            "userPromptAttack": user_attack,
            "documentAttack": doc_attack,
        }
    except Exception as e:
        logger.warning(f"Prompt Shield check failed (non-blocking): {e}")
        return {"attackDetected": False, "userPromptAttack": False, "documentAttack": False}


async def ensure_no_prompt_attack(user_prompt: str, documents: list[str] | None = None) -> str:
    """
    Check for prompt injection attacks. Raises ValueError if detected.
    """
    result = await check_prompt_shield(user_prompt, documents)
    if result["attackDetected"]:
        raise ValueError(
            "Prompt injection attack detected. "
            "Pebble can only respond to genuine, safe requests."
        )
    return user_prompt


# ---------------------------------------------------------------------------
# Groundedness Detection — verify LLM output is grounded in source material
# ---------------------------------------------------------------------------

async def check_groundedness(
    llm_output: str,
    grounding_sources: list[str],
    domain: str = "Generic",
    task: str = "Summarization",
    query: str | None = None,
) -> dict:
    """
    Detect whether LLM output is grounded in the provided source material.

    Uses the Groundedness Detection API (api-version=2024-09-15-preview).

    Returns:
        {
            "grounded": bool,
            "ungroundedPercentage": float,
            "ungroundedDetails": list[dict],
        }
    """
    if not _is_configured():
        return {"grounded": True, "ungroundedPercentage": 0.0, "ungroundedDetails": []}

    url = f"{settings.content_safety_endpoint}/contentsafety/text:detectGroundedness"
    headers = {
        "Ocp-Apim-Subscription-Key": settings.content_safety_key,
        "Content-Type": "application/json",
    }
    payload: dict = {
        "domain": domain,
        "task": task,
        "text": llm_output[:7500],
        "groundingSources": [s[:7500] for s in grounding_sources],
        "reasoning": False,
    }
    if task == "QnA" and query:
        payload["qna"] = {"query": query}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                headers=headers,
                json=payload,
                params={"api-version": "2024-09-15-preview"},
                timeout=15.0,
            )
            resp.raise_for_status()
            data = resp.json()

        ungrounded = data.get("ungroundedDetected", False)
        return {
            "grounded": not ungrounded,
            "ungroundedPercentage": data.get("ungroundedPercentage", 0.0),
            "ungroundedDetails": data.get("ungroundedDetails", []),
        }
    except Exception as e:
        logger.warning(f"Groundedness check failed (non-blocking): {e}")
        return {"grounded": True, "ungroundedPercentage": 0.0, "ungroundedDetails": []}
