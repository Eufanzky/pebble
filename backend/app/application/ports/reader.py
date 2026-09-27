"""The Immersive Reader port: a short-lived token for Microsoft's reader. Optional."""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ReaderToken:
    token: str
    subdomain: str


class ReaderTokenProvider(Protocol):
    async def get_token(self) -> ReaderToken:
        """Raises ``ReaderUnavailableError`` when the reader isn't configured or the token can't be fetched."""
        ...


class ReaderUnavailableError(Exception):
    """The frontend falls back to its built-in reader."""
