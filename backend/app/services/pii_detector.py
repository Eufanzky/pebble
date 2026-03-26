"""
Lightweight regex-based PII detector.

Detects common PII patterns (emails, phone numbers, SSNs, credit cards)
and redacts them before text reaches AI agents. This is part of the
Dual-Safe input/output pipeline alongside Content Safety and Prompt Shields.
"""

import re
from dataclasses import dataclass, field

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


@dataclass
class PIIResult:
    """Result of a PII detection scan."""

    has_pii: bool = False
    categories: list[str] = field(default_factory=list)
    redacted_text: str = ""


def detect_pii(text: str) -> PIIResult:
    """
    Scan text for common PII patterns.

    Returns a PIIResult with a boolean flag, matched category names,
    and a redacted copy of the text.
    """
    found_categories: list[str] = []
    redacted = text

    for category, pattern in _PATTERNS.items():
        if pattern.search(redacted):
            found_categories.append(category)
            redacted = pattern.sub(REDACTION_MARKER, redacted)

    return PIIResult(
        has_pii=bool(found_categories),
        categories=found_categories,
        redacted_text=redacted,
    )


def redact_pii(text: str) -> str:
    """Redact PII from text and return the cleaned version."""
    return detect_pii(text).redacted_text
