"""Legacy shim for the orchestrator in ``app.agents`` (removed in 2.4). Use ``RegexPIIRedactor``."""

from dataclasses import dataclass, field

from app.infrastructure.pii.regex_redactor import RegexPIIRedactor


@dataclass
class PIIResult:
    has_pii: bool = False
    categories: list[str] = field(default_factory=list)
    redacted_text: str = ""


def detect_pii(text: str) -> PIIResult:
    redaction = RegexPIIRedactor().redact(text)
    return PIIResult(has_pii=redaction.found_pii, categories=redaction.categories, redacted_text=redaction.text)


def redact_pii(text: str) -> str:
    return detect_pii(text).redacted_text
