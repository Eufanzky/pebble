"""Everything stored about one user, as a whole: for export and for deleting the account."""

from typing import Protocol


class AccountDataStore(Protocol):
    async def export(self, user_id: str) -> dict[str, list[dict[str, object]]]:
        """Every row the user owns, by table, as JSON-ready values."""
        ...

    async def delete(self, user_id: str) -> None:
        """Remove every row the user owns, in every table."""
        ...
