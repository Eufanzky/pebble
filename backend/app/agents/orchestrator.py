import json
import logging

from app.agents.prompts import ORCHESTRATOR_PROMPT
from app.agents.task_decomposition import decompose_task
from app.agents.document_simplification import simplify_document
from app.agents.motivation import generate_motivation
from app.services.openai_client import chat_completion
from app.services.content_safety import ensure_safe, ensure_no_prompt_attack
from app.services.pii_detector import detect_pii, redact_pii
from app.services.kernel import get_kernel

logger = logging.getLogger("focusbuddy.orchestrator")


async def _classify_intent(user_message: str) -> dict:
    """Use the orchestrator to classify user intent and generate a response."""
    # Input safety pipeline: Prompt Shield → Content Safety → PII Redaction
    await ensure_no_prompt_attack(user_message)
    await ensure_safe(user_message)

    pii_result = detect_pii(user_message)
    if pii_result.has_pii:
        logger.info(f"PII detected and redacted: {pii_result.categories}")
    safe_message = pii_result.redacted_text

    # Try Semantic Kernel orchestration, fall back to direct OpenAI
    try:
        kernel = get_kernel()
        result = await kernel.invoke_prompt(
            ORCHESTRATOR_PROMPT + "\n\nUser message: {{$input}}",
            input=safe_message,
        )
        response_text = str(result)
    except Exception as e:
        logger.warning(f"SK orchestration failed, falling back to direct: {e}")
        response_text = await chat_completion(
            system_prompt=ORCHESTRATOR_PROMPT,
            user_message=safe_message,
            temperature=0.6,
            max_tokens=512,
        )

    # Output safety: Content Safety → PII Redaction
    await ensure_safe(response_text)
    response_text = redact_pii(response_text)

    return json.loads(response_text)


async def handle_chat(
    user_message: str,
    tasks_completed: int = 0,
    tasks_total: int = 0,
    recent_task_titles: list[str] | None = None,
    chunk_size: str = "medium",
    reading_level: int = 5,
    time_of_day: str = "day",
    personality: str = "gentle",
) -> dict:
    """
    Main orchestrator entry point. Classifies intent and routes to the
    appropriate sub-agent, or responds directly for chat/distress.

    Returns:
        {
            "intent": str,
            "response": str,
            "mood": str,
            "agentName": str,
            "data": dict | None  (agent-specific structured data)
        }
    """
    classification = await _classify_intent(user_message)
    intent = classification.get("intent", "chat")

    # Distress — respond immediately with empathy, don't route to sub-agent
    if intent == "distress":
        return {
            "intent": "distress",
            "response": classification.get(
                "response",
                "That sounds really hard. It's okay to step back. "
                "Would you like to clear today's tasks and start smaller?"
            ),
            "mood": "normal",
            "agentName": "PebbleVoice",
            "data": None,
        }

    # Task decomposition
    if intent == "decompose":
        # Extract the task title from the user message
        task_title = user_message
        data = await decompose_task(
            task_title=task_title,
            chunk_size=chunk_size,
            time_of_day=time_of_day,
        )
        return {
            "intent": "decompose",
            "response": classification.get("response", "Here's how I'd break that down."),
            "mood": "happy",
            "agentName": "CalmSense",
            "data": data,
        }

    # Document simplification
    if intent == "simplify":
        data = await simplify_document(
            text=user_message,
            reading_level=reading_level,
        )
        return {
            "intent": "simplify",
            "response": classification.get("response", "Here's a simpler version."),
            "mood": "normal",
            "agentName": "SimplifyCore",
            "data": data,
        }

    # Motivation
    if intent == "motivate":
        data = await generate_motivation(
            tasks_completed=tasks_completed,
            tasks_total=tasks_total,
            recent_task_titles=recent_task_titles or [],
            time_of_day=time_of_day,
            personality=personality,
        )
        return {
            "intent": "motivate",
            "response": data["message"],
            "mood": data["mood"],
            "agentName": "PebbleVoice",
            "data": None,
        }

    # Default: chat response from Pebble
    return {
        "intent": "chat",
        "response": classification.get("response", "I'm here if you need me."),
        "mood": classification.get("mood", "normal"),
        "agentName": "PebbleVoice",
        "data": None,
    }
