"""The preferences store: one saved set per user."""

from typing import Protocol


class PreferencesRepository(Protocol):
    async def get(self, user_id: str) -> dict[str, object] | None:
        """The saved values, as stored (see ``Preferences.to_saved``), or None if the user never saved any."""
        ...

    async def save(self, user_id: str, values: dict[str, object]) -> None: ...
