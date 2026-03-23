import uuid
from datetime import datetime, timezone

from azure.cosmos.exceptions import CosmosHttpResponseError
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from app.models.document_schemas import (
    DocumentResponse,
    ExtractTasksResponse,
    SearchRequest,
    SearchResult,
    SimplifyDocumentRequest,
)
from app.services.auth import get_current_user_id
from app.services.blob_storage import upload_document
from app.services.db import get_container
from app.services.doc_intelligence import extract_text
from app.services.search import index_document, search_documents
from app.agents.document_simplification import simplify_document

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_process(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Upload a document, parse it with Document Intelligence,
    and store in Cosmos DB + Blob Storage.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. "
            "Supported: PDF, Word, plain text.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")

    # Upload to Blob Storage
    blob_url = await upload_document(
        file_bytes=file_bytes,
        filename=file.filename or "document",
        user_id=user_id,
        content_type=file.content_type or "application/octet-stream",
    )

    # Parse with Document Intelligence
    parsed = await extract_text(file_bytes)

    # Detect document type from filename
    doc_type = "technical"
    filename_lower = (file.filename or "").lower()
    if any(w in filename_lower for w in ["syllabus", "lecture", "chapter", "textbook"]):
        doc_type = "academic"
    elif any(w in filename_lower for w in ["meeting", "minutes", "agenda", "notes"]):
        doc_type = "meeting"

    now = datetime.now(timezone.utc).isoformat()
    doc_id = str(uuid.uuid4())

    doc = {
        "id": doc_id,
        "userId": user_id,
        "title": file.filename or "Untitled",
        "type": doc_type,
        "blobUrl": blob_url,
        "originalText": parsed["content"],
        "simplifiedText": None,
        "tags": [],
        "extractedTasks": [],
        "whyExplanation": None,
        "pages": parsed["pages"],
        "createdAt": now,
    }

    # Store in Cosmos DB
    container = await get_container("documents")
    await container.create_item(doc)

    return doc


@router.get("", response_model=list[DocumentResponse])
async def list_documents(user_id: str = Depends(get_current_user_id)):
    """List all documents for the authenticated user."""
    container = await get_container("documents")
    query = "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC"
    items = container.query_items(
        query=query,
        parameters=[{"name": "@userId", "value": user_id}],
    )
    return [item async for item in items]


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single document by ID."""
    container = await get_container("documents")
    try:
        item = await container.read_item(doc_id, partition_key=user_id)
        return item
    except CosmosHttpResponseError as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Document not found")
        raise HTTPException(status_code=500, detail="Database error")


@router.post("/{doc_id}/simplify", response_model=DocumentResponse)
async def simplify_doc(
    doc_id: str,
    body: SimplifyDocumentRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Simplify a document's text using the Document Simplification Agent."""
    container = await get_container("documents")

    try:
        doc = await container.read_item(doc_id, partition_key=user_id)
    except CosmosHttpResponseError as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Document not found")
        raise HTTPException(status_code=500, detail="Database error")

    if not doc.get("originalText"):
        raise HTTPException(status_code=400, detail="Document has no text to simplify")

    # Simplify with GPT-4o agent
    result = await simplify_document(
        text=doc["originalText"],
        reading_level=body.reading_level,
    )

    # Update document with simplified version
    doc["simplifiedText"] = result["simplified"]
    doc["tags"] = result["tags"]
    doc["extractedTasks"] = result["extractedTasks"]
    doc["whyExplanation"] = result["whyExplanation"]

    await container.replace_item(doc_id, doc)

    # Index in AI Search for RAG
    try:
        await index_document(
            doc_id=f"{doc_id}-simplified",
            user_id=user_id,
            document_id=doc_id,
            title=doc["title"],
            content=doc["originalText"],
            simplified=result["simplified"],
            tags=result["tags"],
        )
    except Exception:
        pass  # Search indexing is non-critical

    return doc


@router.post("/{doc_id}/tasks", response_model=ExtractTasksResponse)
async def extract_tasks(
    doc_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Turn a document's extracted tasks into real tasks in the task list."""
    docs_container = await get_container("documents")
    tasks_container = await get_container("tasks")

    try:
        doc = await docs_container.read_item(doc_id, partition_key=user_id)
    except CosmosHttpResponseError as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Document not found")
        raise HTTPException(status_code=500, detail="Database error")

    extracted = doc.get("extractedTasks", [])
    if not extracted:
        raise HTTPException(
            status_code=400,
            detail="No tasks extracted. Simplify the document first.",
        )

    now = datetime.now(timezone.utc).isoformat()
    created_tasks = []

    for task_data in extracted:
        tag = task_data.get("tag", "project")
        if tag not in ("study", "communication", "project", "wellbeing"):
            tag = "project"

        task = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "title": task_data.get("title", ""),
            "timeEstimate": task_data.get("timeEstimate", ""),
            "tag": tag,
            "priority": "medium",
            "completed": False,
            "subtasks": [],
            "showSubtasks": False,
            "whyExplanation": f"Extracted from: {doc['title']}",
            "createdAt": now,
            "updatedAt": now,
        }
        await tasks_container.create_item(task)
        created_tasks.append(task)

    return {
        "tasksCreated": len(created_tasks),
        "tasks": created_tasks,
    }


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doc(
    doc_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a document from Cosmos DB (blob cleanup is async)."""
    container = await get_container("documents")
    try:
        await container.delete_item(doc_id, partition_key=user_id)
    except CosmosHttpResponseError as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Document not found")
        raise HTTPException(status_code=500, detail="Database error")


@router.post("/search", response_model=list[SearchResult])
async def search_docs(
    body: SearchRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Search across user's indexed documents (RAG-ready)."""
    try:
        results = await search_documents(
            query=body.query,
            user_id=user_id,
            top=body.top,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {e}")
