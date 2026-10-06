"""SimplifyCore: rewrites text at the user's reading level and pulls out its action items."""

from dataclasses import replace

from app.application.activity import ActivityLog, note, quote, watch
from app.application.adaptation import UsageSignals
from app.application.agents.whybot import Explain, explain
from app.application.errors import AgentReplyError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMProvider, LLMRequest
from app.application.prompts import SIMPLIFYCORE_PROMPT
from app.application.safety import SafetyGate
from app.domain.adaptation import SignalKind
from app.domain.agents import AgentName
from app.domain.documents import ExtractedTask, Simplification
from app.domain.tasks import TaskTag


class SimplifyDocument:
    def __init__(
        self,
        llm: LLMProvider,
        gate: SafetyGate,
        activity: ActivityLog | None = None,
        whybot: Explain | None = None,
        signals: UsageSignals | None = None,
    ) -> None:
        self.llm = llm
        self.gate = gate
        self.activity = activity
        self.whybot = whybot
        self.signals = signals

    async def __call__(self, text: str, reading_level: int = 5, user_id: str = "") -> Simplification:
        """Screen the input, then simplify it. For callers that haven't screened it.

        With a ``user_id``, the result (or what was held back) goes in the user's activity log.
        """
        async with watch(self.activity, user_id, AgentName.SIMPLIFY_CORE):
            safe_text = await self.gate.screen_input(text)
            simplified = await self.run(safe_text, reading_level)
        found = len(simplified.extracted_tasks)
        reasoning = simplified.why or f"Found {found} action item{'' if found == 1 else 's'}."
        why = await explain(
            self.whybot,
            AgentName.SIMPLIFY_CORE,
            quote(safe_text, 200),
            describe_simplification(simplified, reading_level),
            f"reading level {reading_level} of 10",
            reasoning,
        )
        await note(
            self.activity,
            user_id,
            AgentName.SIMPLIFY_CORE,
            f"Simplified {quote(safe_text)} to reading level {reading_level}",
            reasoning,
            explanation=why,
        )
        if self.signals is not None:
            # The level the user picked for this document: AdaptLens learns from it (7.6)
            await self.signals.note(user_id, SignalKind.READING_LEVEL, reading_level)
        return replace(simplified, why=why)

    async def run(self, text: str, reading_level: int) -> Simplification:
        """Simplify already-screened text. Output is safety-checked, grounded against the text, and redacted."""
        reply = await ask_json(
            self.llm,
            LLMRequest(
                agent=AgentName.SIMPLIFY_CORE,
                system_prompt=SIMPLIFYCORE_PROMPT,
                user_message=f"Target reading level: {reading_level}/10\n\nDocument text:\n{text}",
                temperature=0.5,
                max_tokens=2048,
            ),
        )
        simplification = _parse(reply)
        await self.gate.ensure_output_safe(*simplification.texts())
        groundedness = await self.gate.checker.check_groundedness(simplification.simplified, [text])
        return Simplification(
            simplified=simplification.simplified,
            extracted_tasks=simplification.extracted_tasks,
            tags=simplification.tags,
            why=simplification.why,
            groundedness=groundedness,
        ).map_text(self.gate.redact)


def _parse(reply: dict) -> Simplification:
    simplified = reply.get("simplified")
    tasks = reply.get("extractedTasks", [])
    tags = reply.get("tags", [])
    if not isinstance(simplified, str) or not simplified.strip():
        raise AgentReplyError("simplified must be non-empty text")
    if not isinstance(tasks, list) or not all(isinstance(t, dict) and t.get("title") for t in tasks):
        raise AgentReplyError("extractedTasks must be a list of objects with a title")
    if not isinstance(tags, list):
        raise AgentReplyError("tags must be a list")
    return Simplification(
        simplified=simplified,
        extracted_tasks=tuple(
            ExtractedTask(str(t["title"]), str(t.get("timeEstimate", "")), TaskTag.parse(t.get("tag"))) for t in tasks
        ),
        tags=tuple(str(tag) for tag in tags),
        why=str(reply.get("whyExplanation", "")),
    )


def describe_simplification(simplification: Simplification, reading_level: int) -> str:
    """What SimplifyCore did, for WhyBot."""
    items = "; ".join(t.title for t in simplification.extracted_tasks) or "none"
    return (
        f"Rewrote the text at reading level {reading_level}, starting {quote(simplification.simplified, 120)}. "
        f"Action items: {items}. Its own reason: {simplification.why or 'none given'}"
    )
