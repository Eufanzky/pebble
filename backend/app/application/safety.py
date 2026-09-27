"""The safety gate every agent's input and output passes through."""

import logging
from collections.abc import Sequence

from app.application.errors import PromptAttackError, UnsafeContentError, UnsafeOutputError
from app.application.ports.safety import PIIRedactor, SafetyChecker

logger = logging.getLogger("pebble.safety")


class SafetyGate:
    def __init__(self, checker: SafetyChecker, redactor: PIIRedactor) -> None:
        self.checker = checker
        self.redactor = redactor

    async def screen_input(self, text: str, documents: Sequence[str] = ()) -> str:
        """Prompt Shields, then Content Safety, then PII redaction. Returns the text that may reach the LLM."""
        if await self.checker.detect_prompt_attack(text, documents):
            raise PromptAttackError()
        verdict = await self.checker.analyze_text(text)
        if not verdict.is_safe:
            logger.info("Input rejected: %s", [str(c) for c in verdict.flagged])
            raise UnsafeContentError()
        return self.redact(text)

    async def screen_output(self, text: str) -> str:
        """Content Safety, then PII redaction. Returns the text that may reach the user."""
        verdict = await self.checker.analyze_text(text)
        if not verdict.is_safe:
            logger.info("Output replaced: %s", [str(c) for c in verdict.flagged])
            raise UnsafeOutputError()
        return self.redact(text)

    def redact(self, text: str) -> str:
        redaction = self.redactor.redact(text)
        if redaction.found_pii:
            logger.info("PII redacted: %s", redaction.categories)
        return redaction.text
