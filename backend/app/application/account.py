"""The user's own data: download all of it, or delete the account (principle 3, privacy first)."""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime

from app.application.activity import utc_now
from app.application.ports.account import AccountDataStore


@dataclass
class ExportAccountData:
    store: AccountDataStore
    clock: Callable[[], datetime] = utc_now

    async def __call__(self, user_id: str) -> dict[str, object]:
        return {
            "exportedAt": self.clock().isoformat(),
            "userId": user_id,
            "data": await self.store.export(user_id),
        }


@dataclass
class DeleteAccount:
    store: AccountDataStore

    async def __call__(self, user_id: str) -> None:
        await self.store.delete(user_id)
