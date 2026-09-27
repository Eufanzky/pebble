"""Test doubles for ports that only tests need. The fake LLM lives in ``app.infrastructure.llm.fake``
because ``LLM_PROVIDER=fake`` uses it outside tests too.
"""

from dataclasses import dataclass, field

from app.domain.safety import Groundedness, HarmCategory, SafetyVerdict


@dataclass
class ScriptedSafety:
    """A ``SafetyChecker`` for tests. Everything is safe unless flagged; every check is recorded."""

    flags: list[tuple[str, HarmCategory, int]] = field(default_factory=list)
    attacks: list[str] = field(default_factory=list)
    analyzed: list[str] = field(default_factory=list)
    shielded: list[str] = field(default_factory=list)
    grounded: bool = True
    error: Exception | None = None
    """Raised by ``analyze_text`` when set, as an outage would."""

    def flag(self, text_contains: str, category: HarmCategory = HarmCategory.VIOLENCE, severity: int = 2) -> None:
        """Score any text containing ``text_contains`` at ``severity`` in ``category``."""
        self.flags.append((text_contains, HarmCategory(category), severity))

    def attack_on(self, text_contains: str) -> None:
        """Report a prompt attack for any prompt containing ``text_contains``."""
        self.attacks.append(text_contains)

    async def analyze_text(self, text: str) -> SafetyVerdict:
        self.analyzed.append(text)
        if self.error is not None:
            raise self.error
        severities = {category: 0 for category in HarmCategory}
        for needle, category, severity in self.flags:
            if needle in text:
                severities[category] = max(severities[category], severity)
        return SafetyVerdict(severities)

    async def detect_prompt_attack(self, user_prompt: str, documents=()) -> bool:
        self.shielded.append(user_prompt)
        return any(needle in user_prompt for needle in self.attacks)

    async def check_groundedness(self, output: str, sources) -> Groundedness:
        return Groundedness(grounded=self.grounded, ungrounded_percentage=0.0 if self.grounded else 0.5)
