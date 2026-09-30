from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.api.dependencies import get_import_local_data
from app.api.routers.tasks import task_from
from app.api.schemas.importing import ImportRequest, ImportResponse
from app.application.importing import ImportLocalData
from app.domain.activity import ActivityEntry

router = APIRouter()


@router.post("", response_model=ImportResponse, summary="Import what this browser kept")
async def import_local_data(
    body: ImportRequest,
    user_id: str = Depends(get_current_user),
    import_local_data: ImportLocalData = Depends(get_import_local_data),
):
    """
    Moves tasks, preferences and activity entries that the browser kept before sign-in into your account.
    The frontend sends them once and then forgets its copy.

    - Tasks are added after yours, with their steps.
    - Preferences apply only if you never saved any.
    - Log entries keep their times (none later than now).
    """
    preferences = body.preferences.model_dump(exclude_unset=True, exclude_none=True) if body.preferences else None
    activity = [
        ActivityEntry("", e.timestamp, e.agent, e.action, e.reasoning, e.safety_status) for e in body.activity
    ]
    result = await import_local_data(user_id, [task_from(t) for t in body.tasks], preferences, activity)
    return {"tasks": result.tasks, "preferences": result.preferences, "activity": result.activity}
