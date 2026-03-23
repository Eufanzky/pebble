from azure.ai.formrecognizer.aio import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

from app.config import settings

_client: DocumentAnalysisClient | None = None


def _get_client() -> DocumentAnalysisClient:
    """Get the Document Intelligence async client (singleton)."""
    global _client
    if _client is None:
        _client = DocumentAnalysisClient(
            endpoint=settings.doc_intelligence_endpoint,
            credential=AzureKeyCredential(settings.doc_intelligence_key),
        )
    return _client


async def extract_text(file_bytes: bytes) -> dict:
    """
    Parse a document using Azure Document Intelligence.

    Returns:
        {
            "content": str (full extracted text),
            "pages": int,
            "tables": list[dict] (extracted tables if any),
        }
    """
    client = _get_client()

    poller = await client.begin_analyze_document(
        "prebuilt-read",
        document=file_bytes,
    )
    result = await poller.result()

    # Extract full text content
    content = result.content or ""

    # Count pages
    pages = len(result.pages) if result.pages else 0

    # Extract tables if present
    tables = []
    if result.tables:
        for table in result.tables:
            cells = []
            for cell in table.cells:
                cells.append({
                    "row": cell.row_index,
                    "col": cell.column_index,
                    "text": cell.content,
                })
            tables.append({
                "rowCount": table.row_count,
                "columnCount": table.column_count,
                "cells": cells,
            })

    return {
        "content": content,
        "pages": pages,
        "tables": tables,
    }
