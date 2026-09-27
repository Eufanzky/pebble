"""Safety ports: content analysis, prompt-attack detection, groundedness, and PII redaction."""

from collections.abc import Sequence
from typing import Protocol

from app.domain.safety import Groundedness, Redaction, SafetyVerdict


class SafetyChecker(Protocol):
    async def analyze_text(self, text: str) -> SafetyVerdict:
        """Score ``text`` per harm category. Raises ``SafetyCheckError`` if the check can't run."""
        ...

    async def detect_prompt_attack(self, user_prompt: str, documents: Sequence[str] = ()) -> bool:
        """True if ``user_prompt`` or a document is a jailbreak or prompt injection. Never raises."""
        ...

    async def check_groundedness(self, output: str, sources: Sequence[str]) -> Groundedness:
        """Whether ``output`` is supported by ``sources``. Never raises."""
        ...


class PIIRedactor(Protocol):
    def redact(self, text: str) -> Redaction: ...


class SafetyCheckError(Exception):
    """The content check couldn't run, so the content can't be called safe."""
