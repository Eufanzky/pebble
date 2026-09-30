"""Preference use cases: read them (defaults until the user changes one) and change some of them."""

from dataclasses import dataclass, fields, replace
from typing import Any

from app.application.ports.preferences import PreferencesRepository
from app.domain.preferences import Preferences

EDITABLE_FIELDS = frozenset(f.name for f in fields(Preferences))


@dataclass
class UserPreferences:
    repository: PreferencesRepository

    async def get(self, user_id: str) -> Preferences:
        return Preferences.from_saved(await self.repository.get(user_id) or {})

    async def update(self, user_id: str, changes: dict[str, Any]) -> Preferences:
        unknown = set(changes) - EDITABLE_FIELDS
        if unknown:
            raise ValueError(f"Not a preference: {sorted(unknown)}")
        preferences = replace(await self.get(user_id), **changes)
        await self.repository.save(user_id, preferences.to_saved())
        return preferences
