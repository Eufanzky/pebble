"""SimplifyCore: rewrites text at the user's reading level and pulls out its action items."""

from app.application.errors import AgentReplyError
from app.application.llm_json import ask_json
from app.application.ports.llm import LLMProvider, LLMRequest
from app.application.prompts import DOCUMENT_SIMPLIFICATION_PROMPT
from app.application.safety import SafetyGate
from app.domain.documents import ExtractedTask, Simplification
from app.domain.tasks import TaskTag


class SimplifyDocument:
    def __init__(self, llm: LLMProvider, gate: SafetyGate) -> None:
        self.llm = llm
        self.gate = gate

    async def __call__(self, text: str, reading_level: int = 5) -> Simplification:
        """Screen the input, then simplify it. For callers that haven't screened it."""
        safe_text = await self.gate.screen_input(text)
        return await self.run(safe_text, reading_level)

    async def run(self, text: str, reading_level: int) -> Simplification:
        """Simplify already-screened text. Output is safety-checked, grounded against the text, and redacted."""
        reply = await ask_json(
            self.llm,
            LLMRequest(
                agent="simplify",
                system_prompt=DOCUMENT_SIMPLIFICATION_PROMPT,
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
