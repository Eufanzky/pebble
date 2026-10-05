"""WhyBot: a plain-language "why" for every agent result (7.4)."""

import logging

from app.application.errors import AgentReplyError, UnsafeOutputError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMError, LLMProvider, LLMRequest
from app.application.prompts import WHYBOT_PROMPT
from app.application.safety import SafetyGate
from app.domain.agents import AgentName

logger = logging.getLogger("pebble.whybot")

MAX_WHY = 400


class Explain:
    def __init__(self, llm: LLMProvider, gate: SafetyGate) -> None:
        self.llm = llm
        self.gate = gate

    async def __call__(self, agent: AgentName, asked: str, did: str, settings: str, fallback: str) -> str:
        """Why ``agent`` did what it ``did`` for what was ``asked``, given the user's ``settings``.

        Everything passed in is already screened and redacted. The answer is checked and redacted too. If WhyBot
        can't answer (an outage, an unusable or flagged reply), it's ``fallback``, the agent's own reasoning: an
        explanation never costs the user their answer.
        """
        try:
            reply = await ask_json(
                self.llm,
                LLMRequest(
                    agent=AgentName.WHY_BOT,
                    system_prompt=WHYBOT_PROMPT,
                    user_message=f"Agent: {agent}\nAsked: {asked}\nWhat it did: {did}\nSettings: {settings}",
                    temperature=0.3,
                    # The model reasons before it answers: 256 tokens cut the JSON off
                    max_tokens=512,
                ),
            )
            why = reply.get("why")
            if not isinstance(why, str) or not why.strip():
                raise AgentReplyError("why must be non-empty text")
            return await self.gate.screen_output(why.strip()[:MAX_WHY])
        except (LLMError, AgentReplyError, UnsafeOutputError) as error:
            logger.warning("WhyBot couldn't explain %s's result, using its own reasoning: %s", agent, error)
            return fallback


async def explain(whybot: Explain | None, agent: AgentName, asked: str, did: str, settings: str, fallback: str) -> str:
    """WhyBot's "why" when it's wired in, otherwise the agent's own reasoning."""
    if whybot is None:
        return fallback
    return await whybot(agent, asked, did, settings, fallback)
