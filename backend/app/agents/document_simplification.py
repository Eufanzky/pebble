import json

from app.agents.prompts import DOCUMENT_SIMPLIFICATION_PROMPT
from app.services.openai_client import chat_completion
from app.services.content_safety import ensure_safe


async def simplify_document(
    text: str,
    reading_level: int = 5,
) -> dict:
    """
    Simplify document text to a target reading level.

    Returns:
        {
            "simplified": str,
            "extractedTasks": [{"title": str, "timeEstimate": str, "tag": str}, ...],
            "tags": [str, ...],
            "whyExplanation": str
        }
    """
    user_message = (
        f"Target reading level: {reading_level}/10\n\n"
        f"Document text:\n{text}"
    )

    await ensure_safe(user_message)

    response_text = await chat_completion(
        system_prompt=DOCUMENT_SIMPLIFICATION_PROMPT,
        user_message=user_message,
        temperature=0.5,
        max_tokens=2048,
    )

    await ensure_safe(response_text)

    result = json.loads(response_text)
    return {
        "simplified": result.get("simplified", ""),
        "extractedTasks": result.get("extractedTasks", []),
        "tags": result.get("tags", []),
        "whyExplanation": result.get("whyExplanation", ""),
    }
