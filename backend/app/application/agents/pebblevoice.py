"""PebbleVoice: specific encouragement based on what the user actually did."""

from dataclasses import replace

from app.application.errors import AgentReplyError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMProvider, LLMRequest
from app.application.prompts import MOTIVATION_PROMPT
from app.application.safety import SafetyGate
from app.domain.agents import Mood
from app.domain.chat import ChatContext, Encouragement


class Encourage:
    def __init__(self, llm: LLMProvider, gate: SafetyGate) -> None:
        self.llm = llm
        self.gate = gate

    async def __call__(self, context: ChatContext) -> Encouragement:
        return await self.run(context)

    async def run(self, context: ChatContext) -> Encouragement:
        """Task titles are PII-redacted before the LLM sees them; the message is checked and redacted."""
        context = replace(context, recent_task_titles=tuple(map(self.gate.redact, context.recent_task_titles)))
        completed = ""
        if context.recent_task_titles:
            completed = "\nRecently completed: " + ", ".join(context.recent_task_titles)
        data = await ask_json(
            self.llm,
            LLMRequest(
                agent="motivate",
                system_prompt=MOTIVATION_PROMPT,
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
