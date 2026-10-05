"""PebbleVoice: specific encouragement based on what the user actually did."""

from dataclasses import replace

from app.application.activity import ActivityLog, note, quote, watch
from app.application.agents.whybot import Explain, explain
from app.application.errors import AgentReplyError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMProvider, LLMRequest
from app.application.prompts import PEBBLEVOICE_PROMPT
from app.application.safety import SafetyGate
from app.domain.agents import AgentName, Mood
from app.domain.chat import ChatContext, Encouragement


class Encourage:
    def __init__(
        self, llm: LLMProvider, gate: SafetyGate, activity: ActivityLog | None = None, whybot: Explain | None = None
    ) -> None:
        self.llm = llm
        self.gate = gate
        self.activity = activity
        self.whybot = whybot

    async def __call__(self, context: ChatContext, user_id: str = "") -> Encouragement:
        """With a ``user_id``, the result (or a held-back reply) goes in the user's activity log."""
        async with watch(self.activity, user_id, AgentName.PEBBLE_VOICE):
            encouragement = await self.run(context)
        reasoning = f"Based on {context.tasks_completed} of {context.tasks_total} tasks done today."
        why = await explain(
            self.whybot,
            AgentName.PEBBLE_VOICE,
            "some encouragement",
            f"Said {quote(encouragement.message, 200)}",
            describe_day(context),
            reasoning,
        )
        await note(
            self.activity, user_id, AgentName.PEBBLE_VOICE, "Shared some encouragement", reasoning, explanation=why
        )
        return encouragement

    async def run(self, context: ChatContext) -> Encouragement:
        """Task titles are PII-redacted before the LLM sees them; the message is checked and redacted."""
        context = replace(context, recent_task_titles=tuple(map(self.gate.redact, context.recent_task_titles)))
        completed = ""
        if context.recent_task_titles:
            completed = "\nRecently completed: " + ", ".join(context.recent_task_titles)
        data = await ask_json(
            self.llm,
            LLMRequest(
                agent=AgentName.PEBBLE_VOICE,
                system_prompt=PEBBLEVOICE_PROMPT,
                user_message=(
                    f"Tasks completed today: {context.tasks_completed}/{context.tasks_total}\n"
                    f"Time of day: {context.time_of_day}\n"
                    f"Pebble personality: {context.personality}"
                    f"{completed}\n\n"
                    "Generate a motivational message for the user."
                ),
                temperature=0.8,
                max_tokens=256,
            ),
        )
        message = data.get("message")
        if not isinstance(message, str) or not message.strip():
            raise AgentReplyError("message must be non-empty text")
        return Encouragement(await self.gate.screen_output(message), Mood.parse(data.get("mood")))


def describe_day(context: ChatContext) -> str:
    """The settings and progress that shaped PebbleVoice's words, for WhyBot."""
    return (
        f"{context.tasks_completed} of {context.tasks_total} tasks done today; time of day {context.time_of_day}; "
        f"personality {context.personality}"
    )
