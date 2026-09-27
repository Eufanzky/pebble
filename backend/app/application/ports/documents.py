"""The document-parsing port: file bytes in, plain text out."""

from typing import Protocol

from app.domain.documents import ParsedDocument


class DocumentParser(Protocol):
    def parse(self, content: bytes, filename: str) -> ParsedDocument:
        """Read the text of a file held in memory.

        Raises ``UnsupportedDocumentError`` for a format it can't read, and
        ``UnreadableDocumentError`` for a damaged or protected file.
        """
        ...


class DocumentError(Exception):
    """A document can't be used. The message is safe to show to the user."""


class UnsupportedDocumentError(DocumentError):
    def __init__(self, filename: str) -> None:
        super().__init__(f"Pebble can't read this kind of file yet: {filename}. Try a PDF, Word (.docx) or text file.")


class UnreadableDocumentError(DocumentError):
    def __init__(self, filename: str) -> None:
        super().__init__(f"Pebble couldn't open {filename}. It may be damaged or password-protected.")
