"""Safety rules: harm categories, the severity threshold, and what a check found."""

from collections.abc import Mapping
from dataclasses import dataclass, field
from enum import StrEnum


class HarmCategory(StrEnum):
    HATE = "Hate"
    SELF_HARM = "SelfHarm"
    SEXUAL = "Sexual"
    VIOLENCE = "Violence"


SEVERITY_THRESHOLD = 2
"""Content at or above this severity (0-7 scale) in any category is rejected."""


@dataclass(frozen=True)
class SafetyVerdict:
    severities: Mapping[HarmCategory, int] = field(default_factory=dict)

    @property
    def flagged(self) -> list[HarmCategory]:
        return [category for category, severity in self.severities.items() if severity >= SEVERITY_THRESHOLD]

    @property
    def is_safe(self) -> bool:
        return not self.flagged


@dataclass(frozen=True)
class Groundedness:
    grounded: bool = True
    ungrounded_percentage: float = 0.0


@dataclass(frozen=True)
class Redaction:
    text: str
    categories: list[str] = field(default_factory=list)
    """PII categories found, each listed once (``email``, ``phone``, ...)."""

    @property
    def found_pii(self) -> bool:
        return bool(self.categories)
