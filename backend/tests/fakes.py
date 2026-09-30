"""Test doubles for ports that only tests need. The fake LLM lives in ``app.infrastructure.llm.fake``
because ``LLM_PROVIDER=fake`` uses it outside tests too.
"""

from dataclasses import dataclass, field

from app.domain.activity import ActivityEntry
from app.domain.safety import Groundedness, HarmCategory, SafetyVerdict
from app.domain.tasks import Task


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


@dataclass
class InMemoryTaskRepository:
    """A ``TaskRepository`` in a dict. ``tests/integration/test_task_repository.py`` holds it to the same
    contract as the Postgres one."""

    rows: dict[str, list[Task]] = field(default_factory=dict)

    async def list(self, user_id: str) -> list[Task]:
        return list(self.rows.get(user_id, []))

    async def get(self, user_id: str, task_id: str) -> Task | None:
        return next((t for t in self.rows.get(user_id, []) if t.id == task_id), None)

    async def add(self, user_id: str, task: Task) -> None:
        self.rows.setdefault(user_id, []).append(task)

    async def save(self, user_id: str, task: Task) -> None:
        tasks = self.rows.get(user_id, [])
        index = next((i for i, t in enumerate(tasks) if t.id == task.id), None)
        if index is None:
            raise KeyError(task.id)
        tasks[index] = task

    async def delete(self, user_id: str, task_id: str) -> bool:
        before = len(self.rows.get(user_id, []))
        self.rows[user_id] = [t for t in self.rows.get(user_id, []) if t.id != task_id]
        return len(self.rows[user_id]) < before

    async def delete_all(self, user_id: str) -> None:
        self.rows.pop(user_id, None)


@dataclass
class InMemoryPreferencesRepository:
    saved: dict[str, dict[str, object]] = field(default_factory=dict)

    async def get(self, user_id: str) -> dict[str, object] | None:
        values = self.saved.get(user_id)
        return dict(values) if values is not None else None

    async def save(self, user_id: str, values: dict[str, object]) -> None:
        self.saved[user_id] = dict(values)


@dataclass
class InMemoryActivityRepository:
    entries: dict[str, list[ActivityEntry]] = field(default_factory=dict)

    async def add(self, user_id: str, entry: ActivityEntry) -> None:
        self.entries.setdefault(user_id, []).append(entry)

    async def recent(self, user_id: str, limit: int) -> list[ActivityEntry]:
        return list(reversed(self.entries.get(user_id, [])))[:limit]


@dataclass
class InMemoryAccountData:
    """An ``AccountDataStore`` over the in-memory stores. ``tests/integration/test_account_data.py`` checks
    the Postgres one against the real tables."""

    tasks: InMemoryTaskRepository
    preferences: InMemoryPreferencesRepository
    activity: InMemoryActivityRepository

    async def export(self, user_id: str) -> dict[str, list[dict[str, object]]]:
        saved = self.preferences.saved.get(user_id)
        return {
            "tasks": [{"id": t.id, "title": t.title} for t in self.tasks.rows.get(user_id, [])],
            "preferences": [saved] if saved is not None else [],
            "activity_entries": [{"id": e.id, "action": e.action} for e in self.activity.entries.get(user_id, [])],
        }

    async def delete(self, user_id: str) -> None:
        self.tasks.rows.pop(user_id, None)
        self.preferences.saved.pop(user_id, None)
        self.activity.entries.pop(user_id, None)
