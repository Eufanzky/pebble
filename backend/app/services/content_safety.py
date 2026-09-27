"""Legacy helpers for the code in ``app.agents`` and the verify router (removed in 2.5 and 2.7).

They delegate to the ``SafetyChecker`` port, keeping their old dict-and-ValueError shapes.
"""

from app.api.dependencies import get_container


async def check_text_safety(text: str) -> dict:
    verdict = await get_container().safety_checker.analyze_text(text)
    return {"safe": verdict.is_safe, "categories": {str(c): s for c, s in verdict.severities.items()}}


async def ensure_safe(text: str) -> str:
    """Raises ValueError if the content is flagged."""
    if not (await check_text_safety(text))["safe"]:
        raise ValueError(
            "Content flagged by safety filter. "
            "Pebble can only provide safe, supportive responses."
        )
    return text


async def check_prompt_shield(user_prompt: str, documents: list[str] | None = None) -> dict:
    attack = await get_container().safety_checker.detect_prompt_attack(user_prompt, documents or [])
    return {"attackDetected": attack}


async def check_groundedness(llm_output: str, grounding_sources: list[str], **_: object) -> dict:
    result = await get_container().safety_checker.check_groundedness(llm_output, grounding_sources)
    return {"grounded": result.grounded, "ungroundedPercentage": result.ungrounded_percentage}
