from typing import Optional

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    title: str
    type: str
    blob_url: str = Field(alias="blobUrl")
    original_text: str = Field(alias="originalText")
    simplified_text: Optional[str] = Field(alias="simplifiedText", default=None)
    tags: list[str] = []
    extracted_tasks: list[dict] = Field(alias="extractedTasks", default=[])
    why_explanation: Optional[str] = Field(alias="whyExplanation", default=None)
    pages: int = 0
    created_at: str = Field(alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}


class SimplifyDocumentRequest(BaseModel):
    reading_level: int = Field(alias="readingLevel", default=5, ge=1, le=10)

    model_config = {"populate_by_name": True}


class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    top: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    id: str
    document_id: str = Field(alias="documentId")
    title: str
    simplified: str
    tags: list[str]
    score: float

    model_config = {"populate_by_name": True, "by_alias": True}


class ExtractTasksResponse(BaseModel):
    tasks_created: int = Field(alias="tasksCreated")
    tasks: list[dict]

    model_config = {"populate_by_name": True, "by_alias": True}
