import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query

from app.models.schemas import ActivityCreate, ActivityResponse
from app.services.auth import get_current_user_id
from app.services.db import get_container

router = APIRouter()


@router.get("", response_model=list[ActivityResponse])
async def list_activity(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=50, le=200),
):
    """List activity entries for the authenticated user."""
    container = await get_container("activity")
    query = (
        "SELECT TOP @limit * FROM c WHERE c.userId = @userId "
        "ORDER BY c.timestamp DESC"
    )
    items = container.query_items(
        query=query,
        parameters=[
            {"name": "@userId", "value": user_id},
            {"name": "@limit", "value": limit},
        ],
    )
    return [item async for item in items]


@router.post("", response_model=ActivityResponse, status_code=201)
async def create_activity(
    body: ActivityCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Log a new activity entry."""
    entry = {
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "agent": body.agent.value,
        "action": body.action,
        "reasoning": body.reasoning,
        "safetyStatus": body.safety_status.value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    container = await get_container("activity")
    result = await container.create_item(entry)
    return result
