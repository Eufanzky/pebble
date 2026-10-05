"""CalmSense: breaks a task into small, time-boxed steps."""

from dataclasses import replace

from app.application.activity import ActivityLog, note, quote, watch
from app.application.agents.whybot import Explain, explain
from app.application.errors import AgentReplyError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMProvider, LLMRequest
from app.application.prompts import CALMSENSE_PROMPT
from app.application.safety import SafetyGate
from app.domain.agents import AgentName
from app.domain.tasks import Step, TaskBreakdown


class DecomposeTask:
    def __init__(
        self, llm: LLMProvider, gate: SafetyGate, activity: ActivityLog | None = None, whybot: Explain | None = None
    ) -> None:
        self.llm = llm
        self.gate = gate
        self.activity = activity
        self.whybot = whybot

    async def __call__(
        self, task_title: str, step_size: str = "medium", time_of_day: str = "day", user_id: str = ""
    ) -> TaskBreakdown:
        """Screen the input, then break the task down. For callers that haven't screened it.

        With a ``user_id``, the result (or what was held back) goes in the user's activity log. The breakdown's
        ``why`` is WhyBot's explanation (7.4).
        """
        async with watch(self.activity, user_id, AgentName.CALM_SENSE):
            safe_title = await self.gate.screen_input(task_title)
            breakdown = await self.run(safe_title, step_size, time_of_day)
        reasoning = breakdown.why or f"Steps sized for your step size ({step_size})."
        why = await explain(
            self.whybot,
            AgentName.CALM_SENSE,
            safe_title,
            describe_breakdown(breakdown),
            f"step size {step_size}; time of day {time_of_day}",
            reasoning,
        )
        await note(
            self.activity,
            user_id,
            AgentName.CALM_SENSE,
            f"Broke {quote(safe_title)} into {len(breakdown.steps)} steps",
            reasoning,
            explanation=why,
        )
        return replace(breakdown, why=why)

    async def run(self, task_title: str, step_size: str, time_of_day: str) -> TaskBreakdown:
        """Break down an already-screened task. Output is safety-checked and PII-redacted."""
        reply = await ask_json(
            self.llm,
            LLMRequest(
                agent=AgentName.CALM_SENSE,
                system_prompt=CALMSENSE_PROMPT,
                user_message=(
                    f"Task: {task_title}\n"
                    f"User's preferred step size: {step_size}\n"
                    f"Current time of day: {time_of_day}\n\n"
                    "Break this task into achievable steps."
                ),
                temperature=0.7,
                max_tokens=1024,
            ),
        )
        breakdown = _parse(reply)
        await self.gate.ensure_output_safe(*breakdown.texts())
        return breakdown.map_text(self.gate.redact)


def _parse(reply: dict) -> TaskBreakdown:
    steps = reply.get("steps", [])
    if not isinstance(steps, list) or not all(isinstance(s, dict) and s.get("title") for s in steps):
        raise AgentReplyError("steps must be a list of objects with a title")
    return TaskBreakdown(
        steps=tuple(Step(str(s["title"]), str(s.get("timeEstimate", ""))) for s in steps),
        why=str(reply.get("whyExplanation", "")),
        title=str(reply.get("title", "")).strip()[:200],
    )


def describe_breakdown(breakdown: TaskBreakdown) -> str:
    """What CalmSense did, for WhyBot."""
    steps = "; ".join(f"{s.title} ({s.time_estimate})" if s.time_estimate else s.title for s in breakdown.steps)
    return f"Split it into {len(breakdown.steps)} steps: {steps}. Its own reason: {breakdown.why or 'none given'}"
