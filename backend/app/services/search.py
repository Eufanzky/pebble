from azure.core.credentials import AzureKeyCredential
from azure.search.documents.aio import SearchClient
from azure.search.documents.indexes.aio import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SearchField,
    SearchFieldDataType,
    SimpleField,
    SearchableField,
)

from app.config import settings

_search_client: SearchClient | None = None
_index_initialized: bool = False


async def _ensure_index() -> None:
    """Create the search index if it doesn't exist."""
    global _index_initialized
    if _index_initialized:
        return

    if not settings.search_endpoint or not settings.search_key:
        return

    index_client = SearchIndexClient(
        endpoint=settings.search_endpoint,
        credential=AzureKeyCredential(settings.search_key),
    )

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SimpleField(name="userId", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="documentId", type=SearchFieldDataType.String, filterable=True),
        SearchableField(name="title", type=SearchFieldDataType.String),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SearchableField(name="simplified", type=SearchFieldDataType.String),
        SimpleField(name="tags", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
        SimpleField(name="createdAt", type=SearchFieldDataType.String, sortable=True),
    ]

    index = SearchIndex(name=settings.search_index_name, fields=fields)

    async with index_client:
        await index_client.create_or_update_index(index)

    _index_initialized = True


def _get_client() -> SearchClient:
    """Get the Search async client (singleton)."""
    global _search_client
    if _search_client is None:
        _search_client = SearchClient(
            endpoint=settings.search_endpoint,
            index_name=settings.search_index_name,
            credential=AzureKeyCredential(settings.search_key),
        )
    return _search_client


async def index_document(
    doc_id: str,
    user_id: str,
    document_id: str,
    title: str,
    content: str,
    simplified: str,
    tags: list[str],
) -> None:
    """Index a document for search."""
    await _ensure_index()
    client = _get_client()

    from datetime import datetime, timezone
    doc = {
        "id": doc_id,
        "userId": user_id,
        "documentId": document_id,
        "title": title,
        "content": content,
        "simplified": simplified,
        "tags": tags,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    async with client:
        await client.upload_documents([doc])


async def search_documents(
    query: str,
    user_id: str,
    top: int = 5,
) -> list[dict]:
    """Search indexed documents for a user."""
    await _ensure_index()
    client = _get_client()

    async with client:
        results = await client.search(
            search_text=query,
            filter=f"userId eq '{user_id}'",
            top=top,
            select=["id", "documentId", "title", "simplified", "tags", "createdAt"],
        )

        docs = []
        async for result in results:
            docs.append({
                "id": result["id"],
                "documentId": result["documentId"],
                "title": result["title"],
                "simplified": result["simplified"],
                "tags": result["tags"],
                "score": result["@search.score"],
            })

    return docs
