import json

from app.agents.prompts import TASK_DECOMPOSITION_PROMPT
from app.services.openai_client import chat_completion
from app.services.content_safety import ensure_safe


async def decompose_task(
    task_title: str,
    chunk_size: str = "medium",
    time_of_day: str = "day",
) -> dict:
    """
    Break a task into time-boxed subtasks.

    Returns:
        {
            "subtasks": [{"title": str, "timeEstimate": str}, ...],
            "whyExplanation": str
        }
    """
    user_message = (
        f"Task: {task_title}\n"
        f"User's preferred chunk size: {chunk_size}\n"
        f"Current time of day: {time_of_day}\n\n"
        "Break this task into achievable subtasks."
    )

    # Check input safety
    await ensure_safe(user_message)

    response_text = await chat_completion(
        system_prompt=TASK_DECOMPOSITION_PROMPT,
        user_message=user_message,
        temperature=0.7,
        max_tokens=1024,
    )

    # Check output safety
    await ensure_safe(response_text)

    result = json.loads(response_text)
    return {
        "subtasks": result.get("subtasks", []),
        "whyExplanation": result.get("whyExplanation", ""),
    }
