"""The orchestrator: screens a chat message, works out the intent, and routes it to an agent.

Every turn goes through the same pipeline: input safety → PII redaction → classifier
→ output safety → the routed agent (which checks its own output). Sub-agents only
ever see the redacted message.
"""

import logging
from dataclasses import dataclass
from typing import Protocol

from app.application.activity import ActivityLog, note, quote, watch
from app.application.agents.calmsense import DecomposeTask
from app.application.errors import AgentReplyError, UnsafeOutputError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMProvider, LLMRequest
from app.application.prompts import ORCHESTRATOR_PROMPT
from app.application.safety import SafetyGate
from app.domain.activity import SafetyStatus
from app.domain.agents import AgentName, Intent, Mood
from app.domain.chat import ChatContext, ChatReply, Encouragement
from app.domain.documents import Simplification

logger = logging.getLogger("pebble.orchestrator")

# Pebble's words when an agent can't give a usable answer. Short, calm, no blame.
SAFE_REPLY = "I'd rather not answer that one. Want to try something else together?"
UNCLEAR_REPLY = "I didn't quite catch that. Could you say it another way?"
DEFAULT_RESPONSES = {
    Intent.DISTRESS: (
        "That sounds really hard. It's okay to step back. Would you like to clear today's tasks and start smaller?"
    ),
    Intent.DECOMPOSE: "Here's how I'd break that down.",
    Intent.SIMPLIFY: "Here's a simpler version.",
    Intent.CHAT: "I'm here if you need me.",
}
AGENT_FAILED = {
    Intent.DECOMPOSE: "I couldn't break that down just now. Want to try again?",
    Intent.SIMPLIFY: "I couldn't simplify that just now. Want to try again?",
    Intent.MOTIVATE: "I'm here with you. One small step is enough.",
}


class SimplifyAgent(Protocol):
    async def run(self, text: str, reading_level: int) -> Simplification:
        """Simplify already-screened text. Raises ``UnsafeOutputError`` or ``AgentReplyError``."""
        ...


class MotivateAgent(Protocol):
    async def run(self, context: ChatContext) -> Encouragement:
        """Encouragement from the user's progress. Raises ``UnsafeOutputError`` or ``AgentReplyError``."""
        ...


@dataclass(frozen=True)
class Classification:
    intent: Intent
    response: str
    mood: Mood
    safety: SafetyStatus = SafetyStatus.PASSED


class HandleChat:
    def __init__(
        self,
        llm: LLMProvider,
        gate: SafetyGate,
        calmsense: DecomposeTask,
        simplifycore: SimplifyAgent,
        pebblevoice: MotivateAgent,
        activity: ActivityLog | None = None,
    ) -> None:
        self.llm = llm
        self.gate = gate
        self.calmsense = calmsense
        self.simplifycore = simplifycore
        self.pebblevoice = pebblevoice
        self.activity = activity

    async def __call__(self, message: str, context: ChatContext, user_id: str = "") -> ChatReply:
        """With a ``user_id``, every turn (and every held-back message) goes in the user's activity log."""
        async with watch(self.activity, user_id, AgentName.PEBBLE_VOICE):
            safe_message = await self.gate.screen_input(message)
        classification = await self._classify(safe_message)
        route = {
            Intent.DISTRESS: self._distress,
            Intent.DECOMPOSE: self._decompose,
            Intent.SIMPLIFY: self._simplify,
            Intent.MOTIVATE: self._motivate,
        }.get(classification.intent, self._chat)
        reply = await route(classification, safe_message, context)
        await note(self.activity, user_id, reply.agent, *_describe(safe_message, reply), reply.safety)
        return reply

    async def _classify(self, safe_message: str) -> Classification:
        try:
            reply = await ask_json(
                self.llm,
                LLMRequest(
                    agent="orchestrator",
                    system_prompt=ORCHESTRATOR_PROMPT,
                    user_message=safe_message,
                    temperature=0.6,
                    max_tokens=512,
                ),
            )
        except AgentReplyError as e:
            logger.warning("Classifier reply isn't JSON, answering as chat: %s", e)
            return Classification(Intent.CHAT, UNCLEAR_REPLY, Mood.NORMAL)

        intent = Intent.parse(reply.get("intent"))
        response = str(reply.get("response") or DEFAULT_RESPONSES.get(intent, DEFAULT_RESPONSES[Intent.CHAT]))
        try:
            response = await self.gate.screen_output(response)
        except UnsafeOutputError:
            return Classification(Intent.CHAT, SAFE_REPLY, Mood.NORMAL, SafetyStatus.FLAGGED)
        return Classification(intent, response, Mood.parse(reply.get("mood")))

    async def _chat(self, c: Classification, _message: str, _context: ChatContext) -> ChatReply:
        return ChatReply(Intent.CHAT, c.response, c.mood, AgentName.PEBBLE_VOICE, safety=c.safety)

    async def _distress(self, c: Classification, _message: str, _context: ChatContext) -> ChatReply:
        # Straight back to the user: no sub-agent, no task talk beyond the offer.
        return ChatReply(Intent.DISTRESS, c.response, Mood.NORMAL, AgentName.PEBBLE_VOICE)

    async def _decompose(self, c: Classification, message: str, context: ChatContext) -> ChatReply:
        try:
            breakdown = await self.calmsense.run(message, context.step_size, context.time_of_day)
        except (UnsafeOutputError, AgentReplyError) as e:
            return self._failed(Intent.DECOMPOSE, AgentName.CALM_SENSE, e)
        return ChatReply(Intent.DECOMPOSE, c.response, Mood.HAPPY, AgentName.CALM_SENSE, breakdown)

    async def _simplify(self, c: Classification, message: str, context: ChatContext) -> ChatReply:
        try:
            simplified = await self.simplifycore.run(message, context.reading_level)
        except (UnsafeOutputError, AgentReplyError) as e:
            return self._failed(Intent.SIMPLIFY, AgentName.SIMPLIFY_CORE, e)
        return ChatReply(Intent.SIMPLIFY, c.response, Mood.NORMAL, AgentName.SIMPLIFY_CORE, simplified)

    async def _motivate(self, _c: Classification, _message: str, context: ChatContext) -> ChatReply:
        try:
            encouragement = await self.pebblevoice.run(context)
        except (UnsafeOutputError, AgentReplyError) as e:
            return self._failed(Intent.MOTIVATE, AgentName.PEBBLE_VOICE, e)
        return ChatReply(Intent.MOTIVATE, encouragement.message, encouragement.mood, AgentName.PEBBLE_VOICE)

    @staticmethod
    def _failed(intent: Intent, agent: AgentName, error: Exception) -> ChatReply:
        if isinstance(error, UnsafeOutputError):
            return ChatReply(intent, SAFE_REPLY, Mood.NORMAL, agent, safety=SafetyStatus.FLAGGED)
        logger.warning("%s reply unusable: %s", agent, error)
        return ChatReply(intent, AGENT_FAILED[intent], Mood.NORMAL, agent)


def _describe(safe_message: str, reply: ChatReply) -> tuple[str, str]:
    """The activity entry for a chat turn: what was asked (redacted), and where it went."""
    reasoning = f"Routed to {reply.agent}. Mood: {reply.mood}."
    if reply.safety is SafetyStatus.FLAGGED:
        reasoning += " Content Safety flagged the reply, so Pebble gave a safe one instead."
    return f"Chat: {reply.intent} — {quote(safe_message)}", reasoning
