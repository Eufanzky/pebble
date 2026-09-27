"""In-process, regex-based PII redaction (emails, phone numbers, SSNs, credit cards).

Runs before any text reaches the LLM and on the LLM's replies. No text leaves
the process to be redacted.
"""

import re

from app.domain.safety import Redaction

_PATTERNS: dict[str, re.Pattern[str]] = {
    "email": re.compile(
        r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    ),
    "phone": re.compile(
        r"(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
    ),
    "ssn": re.compile(
        r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b",
    ),
    "credit_card": re.compile(
        r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b",
    ),
}

REDACTION_MARKER = "[REDACTED]"


class RegexPIIRedactor:
    def redact(self, text: str) -> Redaction:
        categories: list[str] = []
        redacted = text
        for category, pattern in _PATTERNS.items():
            if pattern.search(redacted):
                categories.append(category)
                redacted = pattern.sub(REDACTION_MARKER, redacted)
        return Redaction(text=redacted, categories=categories)
