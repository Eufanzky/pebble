import pytest

from app.application.documents import MAX_DOCUMENT_BYTES, DocumentTooLargeError, EmptyDocumentError, ParseDocument
from app.domain.documents import DocumentType, ParsedDocument


class StubParser:
    def __init__(self, text: str = "Some text") -> None:
        self.text = text
        self.calls: list[str] = []

    def parse(self, content: bytes, filename: str) -> ParsedDocument:
        self.calls.append(filename)
        return ParsedDocument(title=filename, text=self.text, pages=1)


def test_returns_the_parsed_document_with_a_guessed_type():
    document = ParseDocument(StubParser())(b"x", "Lecture 3.pdf")

    assert document == ParsedDocument("Lecture 3.pdf", "Some text", 1, DocumentType.ACADEMIC)


def test_too_large_is_rejected_before_parsing():
    parser = StubParser()

    with pytest.raises(DocumentTooLargeError):
        ParseDocument(parser)(b"x" * (MAX_DOCUMENT_BYTES + 1), "big.pdf")

    assert parser.calls == []


@pytest.mark.parametrize("text", ["", "  \n "])
def test_no_text_is_an_error(text):
    with pytest.raises(EmptyDocumentError, match="scan.pdf"):
        ParseDocument(StubParser(text))(b"x", "scan.pdf")
