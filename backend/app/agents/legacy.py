"""Temporary adapters: the legacy SimplifyCore and PebbleVoice code behind the ``HandleChat`` protocols.

Removed in 2.5, when both become use cases.
"""

import json

from app.agents.document_simplification import simplify_document
from app.agents.motivation import generate_motivation
from app.application.errors import AgentReplyError, UnsafeOutputError
from app.application.safety import SafetyGate
from app.domain.agents import Mood
from app.domain.chat import ChatContext


class LegacySimplifier:
    def __init__(self, gate: SafetyGate) -> None:
        self.gate = gate

    async def run(self, text: str, reading_level: int) -> dict:
        try:
            data = await simplify_document(text=text, reading_level=reading_level)
        except json.JSONDecodeError as e:
            raise AgentReplyError(str(e)) from e
        except ValueError as e:  # the legacy safety check
            raise UnsafeOutputError() from e
        redact = self.gate.redact
        return {
            **data,
            "simplified": redact(data["simplified"]),
            "whyExplanation": redact(data["whyExplanation"]),
            "extractedTasks": [
                {**t, "title": redact(t["title"])} if isinstance(t, dict) and "title" in t else t
                for t in data["extractedTasks"]
            ],
        }


class LegacyMotivator:
    def __init__(self, gate: SafetyGate) -> None:
        self.gate = gate

    async def run(self, context: ChatContext) -> tuple[str, Mood]:
        try:
            data = await generate_motivation(
                tasks_completed=context.tasks_completed,
                tasks_total=context.tasks_total,
                recent_task_titles=list(context.recent_task_titles),
                time_of_day=context.time_of_day,
                personality=context.personality,
            )
        except json.JSONDecodeError as e:
            raise AgentReplyError(str(e)) from e
        except ValueError as e:
            raise UnsafeOutputError() from e
        return self.gate.redact(data["message"]), Mood.parse(data["mood"])
