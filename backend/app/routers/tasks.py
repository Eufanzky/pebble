import uuid
from datetime import datetime, timezone

from azure.cosmos.exceptions import CosmosHttpResponseError
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.services.auth import get_current_user_id
from app.services.db import get_container

router = APIRouter()


@router.get("", response_model=list[TaskResponse])
async def list_tasks(user_id: str = Depends(get_current_user_id)):
    """List all tasks for the authenticated user."""
    container = await get_container("tasks")
    query = "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC"
    items = container.query_items(
        query=query,
        parameters=[{"name": "@userId", "value": user_id}],
    )
    return [item async for item in items]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new task."""
    now = datetime.now(timezone.utc).isoformat()
    task = {
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "title": body.title,
        "timeEstimate": body.time_estimate,
        "tag": body.tag.value,
        "priority": body.priority.value,
        "completed": False,
        "subtasks": [s.model_dump(by_alias=True) for s in body.subtasks],
        "showSubtasks": False,
        "whyExplanation": body.why_explanation,
        "createdAt": now,
        "updatedAt": now,
    }

    container = await get_container("tasks")
    result = await container.create_item(task)
    return result


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single task by ID."""
    container = await get_container("tasks")
    try:
        item = await container.read_item(task_id, partition_key=user_id)
        return item
    except CosmosHttpResponseError as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Task not found")
        raise HTTPException(status_code=500, detail="Database error")


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    body: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Partially update a task."""
    container = await get_container("tasks")

    try:
        existing = await container.read_item(task_id, partition_key=user_id)
    except CosmosHttpResponseError as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Task not found")
        raise HTTPException(status_code=500, detail="Database error")

    updates = body.model_dump(by_alias=True, exclude_none=True)
    if "subtasks" in updates:
        updates["subtasks"] = [s.model_dump(by_alias=True) for s in body.subtasks]

    existing.update(updates)
    existing["updatedAt"] = datetime.now(timezone.utc).isoformat()

    result = await container.replace_item(task_id, existing)
    return result


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a task."""
    container = await get_container("tasks")
    try:
        await container.delete_item(task_id, partition_key=user_id)
    except CosmosHttpResponseError as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Task not found")
        raise HTTPException(status_code=500, detail="Database error")
