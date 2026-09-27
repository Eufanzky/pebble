"""``SafetyChecker`` for when Content Safety isn't configured: everything passes.

PII redaction is separate and in-process, so it still runs.
"""

from collections.abc import Sequence

from app.domain.safety import Groundedness, SafetyVerdict


class NoOpSafetyChecker:
    async def analyze_text(self, text: str) -> SafetyVerdict:
        return SafetyVerdict()

    async def detect_prompt_attack(self, user_prompt: str, documents: Sequence[str] = ()) -> bool:
        return False

    async def check_groundedness(self, output: str, sources: Sequence[str]) -> Groundedness:
        return Groundedness()
