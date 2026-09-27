"""Regenerates the small document fixtures: ``uv run python tests/fixtures/documents/make_fixtures.py``."""

import io
from datetime import datetime
from pathlib import Path

import docx
from pypdf import PdfReader, PdfWriter

HERE = Path(__file__).parent
PAGES = ["Week 1: Read chapter 4 of the design textbook.", "Week 2: Hand in the research report by Friday."]


def minimal_pdf(pages: list[str]) -> bytes:
    """A valid PDF with one line of Helvetica text per page, built by hand with a correct xref table."""
    count = len(pages)
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [" + b" ".join(f"{4 + 2 * i} 0 R".encode() for i in range(count)) + b"] "
        + f"/Count {count} >>".encode(),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    for i, text in enumerate(pages):
        stream = f"BT /F1 12 Tf 72 720 Td ({text}) Tj ET".encode()
        objects.append(
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> "
            f"/Contents {5 + 2 * i} 0 R >>".encode()
        )
        objects.append(f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream")

    out = bytearray(b"%PDF-1.4\n")
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{number} 0 obj\n".encode() + body + b"\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode()
    out += b"".join(f"{offset:010d} 00000 n \n".encode() for offset in offsets)
    out += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    return bytes(out)


def main() -> None:
    pdf = minimal_pdf(PAGES)
    (HERE / "syllabus.pdf").write_bytes(pdf)
    (HERE / "corrupt.pdf").write_bytes(pdf[: len(pdf) // 3])

    writer = PdfWriter(clone_from=PdfReader(io.BytesIO(pdf)))
    writer.encrypt("secret")
    with open(HERE / "locked.pdf", "wb") as f:
        writer.write(f)

    document = docx.Document()
    document.add_heading("Meeting notes", level=1)
    document.add_paragraph("Sam will send the draft on Tuesday.")
    table = document.add_table(rows=1, cols=2)
    table.rows[0].cells[0].text = "Owner"
    table.rows[0].cells[1].text = "Sam"
    document.core_properties.created = datetime(2026, 1, 1)  # fixed, so regenerating gives the same file
    document.save(HERE / "meeting-notes.docx")
    (HERE / "corrupt.docx").write_bytes(b"PK\x03\x04 this is not a real zip archive")

    (HERE / "notes.txt").write_text("Buy stamps.\nPost the form.\n", encoding="utf-8")
    (HERE / "scan.pdf").write_bytes(minimal_pdf([""]))


if __name__ == "__main__":
    main()
