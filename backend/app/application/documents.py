"""Reading an uploaded document. The file is parsed in memory and never stored."""

from dataclasses import replace

from app.application.ports.documents import DocumentError, DocumentParser
from app.domain.documents import DocumentType, ParsedDocument

MAX_DOCUMENT_BYTES = 10 * 1024 * 1024


class DocumentTooLargeError(DocumentError):
    def __init__(self) -> None:
        super().__init__("This file is over 10 MB. Try a smaller part of it.")


class EmptyDocumentError(DocumentError):
    def __init__(self, filename: str) -> None:
        super().__init__(f"Pebble found no text in {filename}. If it's a scan, try a copy with selectable text.")


class ParseDocument:
    def __init__(self, parser: DocumentParser) -> None:
        self.parser = parser

    def __call__(self, content: bytes, filename: str) -> ParsedDocument:
        if len(content) > MAX_DOCUMENT_BYTES:
            raise DocumentTooLargeError()
        document = self.parser.parse(content, filename)
        if not document.text.strip():
            raise EmptyDocumentError(filename)
        return replace(document, type=DocumentType.guess(filename))
