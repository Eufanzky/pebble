from fastapi import APIRouter, Depends, Query, status

from app.api.auth import get_current_user
from app.api.dependencies import get_activity
from app.api.presenters import activity_data
from app.api.schemas.activity import ActivityEntryIn, ActivityEntryOut
from app.application.activity import MAX_LIMIT, ActivityLog

router = APIRouter()


@router.get("", response_model=list[ActivityEntryOut], summary="Your activity log")
async def list_activity(
    limit: int = Query(default=50, ge=1, le=MAX_LIMIT),
    user_id: str = Depends(get_current_user),
    activity: ActivityLog = Depends(get_activity),
):
    """What each agent did for you and why, newest first. The agents write their own entries."""
    return [activity_data(entry) for entry in await activity.recent(user_id, limit)]


@router.post("", response_model=ActivityEntryOut, status_code=status.HTTP_201_CREATED, summary="Log an action")
async def add_activity(
    body: ActivityEntryIn,
    user_id: str = Depends(get_current_user),
    activity: ActivityLog = Depends(get_activity),
):
    """Log something you did that Pebble reacted to, such as finishing a task. Pebble sets the time."""
    entry = await activity.record(user_id, body.agent, body.action, body.reasoning, body.safety_status)
    return activity_data(entry)
