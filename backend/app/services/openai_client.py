"""Legacy helper for the SimplifyCore and PebbleVoice code in ``app.agents`` (removed in 2.5).

It now goes through the ``LLMProvider`` port, so those agents use the configured
provider (and the fake in tests) like every other agent.
"""

from app.api.dependencies import get_container
from app.application.ports.llm import LLMRequest
from app.application.prompts import DOCUMENT_SIMPLIFICATION_PROMPT, MOTIVATION_PROMPT

_AGENT_BY_PROMPT = {DOCUMENT_SIMPLIFICATION_PROMPT: "simplify", MOTIVATION_PROMPT: "motivate"}


async def chat_completion(
    system_prompt: str,
    user_message: str,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> str:
    return await get_container().llm.complete(
        LLMRequest(
            agent=_AGENT_BY_PROMPT.get(system_prompt, "other"),
            system_prompt=system_prompt,
            user_message=user_message,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=system_prompt in _AGENT_BY_PROMPT,
        )
    )
