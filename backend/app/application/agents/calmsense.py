"""CalmSense: breaks a task into small, time-boxed steps."""

from app.application.activity import ActivityLog, note, quote, watch
from app.application.errors import AgentReplyError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMProvider, LLMRequest
from app.application.prompts import TASK_DECOMPOSITION_PROMPT
from app.application.safety import SafetyGate
from app.domain.agents import AgentName
from app.domain.tasks import Step, TaskBreakdown


class DecomposeTask:
    def __init__(self, llm: LLMProvider, gate: SafetyGate, activity: ActivityLog | None = None) -> None:
        self.llm = llm
        self.gate = gate
        self.activity = activity

    async def __call__(
        self, task_title: str, chunk_size: str = "medium", time_of_day: str = "day", user_id: str = ""
    ) -> TaskBreakdown:
        """Screen the input, then break the task down. For callers that haven't screened it.

        With a ``user_id``, the result (or what was held back) goes in the user's activity log.
        """
        async with watch(self.activity, user_id, AgentName.CALM_SENSE):
            safe_title = await self.gate.screen_input(task_title)
            breakdown = await self.run(safe_title, chunk_size, time_of_day)
        await note(
            self.activity,
            user_id,
            AgentName.CALM_SENSE,
            f"Broke {quote(safe_title)} into {len(breakdown.steps)} steps",
            breakdown.why or f"Steps sized for your {chunk_size} chunk setting.",
        )
        return breakdown

    async def run(self, task_title: str, chunk_size: str, time_of_day: str) -> TaskBreakdown:
        """Break down an already-screened task. Output is safety-checked and PII-redacted."""
        reply = await ask_json(
            self.llm,
            LLMRequest(
                agent="decompose",
                system_prompt=TASK_DECOMPOSITION_PROMPT,
                user_message=(
                    f"Task: {task_title}\n"
                    f"User's preferred chunk size: {chunk_size}\n"
                    f"Current time of day: {time_of_day}\n\n"
                    "Break this task into achievable subtasks."
                ),
                temperature=0.7,
                max_tokens=1024,
            ),
        )
        breakdown = _parse(reply)
        await self.gate.ensure_output_safe(*breakdown.texts())
        return breakdown.map_text(self.gate.redact)


def _parse(reply: dict) -> TaskBreakdown:
    subtasks = reply.get("subtasks", [])
    if not isinstance(subtasks, list) or not all(isinstance(s, dict) and s.get("title") for s in subtasks):
        raise AgentReplyError("subtasks must be a list of objects with a title")
    return TaskBreakdown(
        steps=tuple(Step(str(s["title"]), str(s.get("timeEstimate", ""))) for s in subtasks),
        why=str(reply.get("whyExplanation", "")),
    )
