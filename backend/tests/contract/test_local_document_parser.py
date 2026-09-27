"""The local parser against small fixture files (``tests/fixtures/documents``, see ``make_fixtures.py``)."""

from pathlib import Path

import pytest

from app.application.ports.documents import UnreadableDocumentError, UnsupportedDocumentError
from app.infrastructure.parsing.local_parser import LocalDocumentParser

FIXTURES = Path(__file__).parents[1] / "fixtures" / "documents"
parse = LocalDocumentParser().parse


def fixture(name: str) -> bytes:
    return (FIXTURES / name).read_bytes()


def test_pdf_text_from_every_page():
    document = parse(fixture("syllabus.pdf"), "syllabus.pdf")

    assert document.pages == 2
    assert document.text == (
        "Week 1: Read chapter 4 of the design textbook.\n\nWeek 2: Hand in the research report by Friday."
    )
    assert document.title == "syllabus.pdf"


def test_docx_paragraphs_and_tables():
    document = parse(fixture("meeting-notes.docx"), "meeting-notes.docx")

    assert document.text == "Meeting notes\nSam will send the draft on Tuesday.\nOwner | Sam"
    assert document.pages == 1


@pytest.mark.parametrize("name", ["notes.txt", "notes.md", "NOTES.TXT"])
def test_plain_text(name):
    assert parse(fixture("notes.txt"), name).text == "Buy stamps.\nPost the form."


@pytest.mark.parametrize(
    ("content", "text"),
    [("Café ✨".encode(), "Café ✨"), (b"\xef\xbb\xbfWith BOM", "With BOM"), ("Café".encode("cp1252"), "Café")],
    ids=["utf-8", "utf-8-bom", "cp1252"],
)
def test_text_encodings(content, text):
    assert parse(content, "a.txt").text == text


def test_title_is_the_file_name_without_folders():
    assert parse(b"x", "C:/Users/sam/notes.txt").title == "notes.txt"


def test_scanned_pdf_has_no_text():
    document = parse(fixture("scan.pdf"), "scan.pdf")

    assert (document.text, document.pages) == ("", 1)


@pytest.mark.parametrize("name", ["corrupt.pdf", "corrupt.docx", "locked.pdf"])
def test_damaged_or_protected_files_are_unreadable(name):
    with pytest.raises(UnreadableDocumentError, match=name):
        parse(fixture(name), name)


@pytest.mark.parametrize("name", ["old.doc", "picture.png", "no-extension"])
def test_other_formats_are_unsupported(name):
    with pytest.raises(UnsupportedDocumentError):
        parse(b"data", name)


def test_nothing_is_written_to_disk(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)

    for name in ["syllabus.pdf", "meeting-notes.docx", "notes.txt"]:
        parse(fixture(name), name)

    assert list(tmp_path.iterdir()) == []
