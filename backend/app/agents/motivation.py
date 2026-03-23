import json

from app.agents.prompts import MOTIVATION_PROMPT
from app.services.openai_client import chat_completion
from app.services.content_safety import ensure_safe


async def generate_motivation(
    tasks_completed: int,
    tasks_total: int,
    recent_task_titles: list[str],
    time_of_day: str = "day",
    personality: str = "gentle",
) -> dict:
    """
    Generate specific, personalized encouragement.

    Returns:
        {
            "message": str,
            "mood": "sleepy" | "normal" | "happy" | "excited"
        }
    """
    completed_list = ""
    if recent_task_titles:
        completed_list = "\nRecently completed: " + ", ".join(recent_task_titles)

    user_message = (
        f"Tasks completed today: {tasks_completed}/{tasks_total}\n"
        f"Time of day: {time_of_day}\n"
        f"Pebble personality: {personality}"
        f"{completed_list}\n\n"
        "Generate a motivational message for the user."
    )

    response_text = await chat_completion(
        system_prompt=MOTIVATION_PROMPT,
        user_message=user_message,
        temperature=0.8,
        max_tokens=256,
    )

    await ensure_safe(response_text)

    result = json.loads(response_text)
    return {
        "message": result.get("message", ""),
        "mood": result.get("mood", "normal"),
    }
