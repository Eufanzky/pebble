from fastapi import APIRouter, Depends, Query

from app.api.auth import get_current_user
from app.api.dependencies import get_activity
from app.api.presenters import activity_data
from app.api.schemas.activity import ActivityEntryOut
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
