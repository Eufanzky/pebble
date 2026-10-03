from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.auth import get_current_user
from app.api.dependencies import get_progress_log, get_progress_stats
from app.api.presenters import stats_data
from app.api.schemas.stats import FocusSession, StatsOut
from app.application.progress import ProgressLog, ProgressStats

router = APIRouter()


@router.get("", response_model=StatsOut, summary="Your progress")
async def get_stats(
    days: int = Query(default=7, ge=1, le=366, description="How many days, up to and including today"),
    tz: str = Query(default="UTC", max_length=64, description="Your time zone, e.g. Europe/Berlin"),
    user_id: str = Depends(get_current_user),
    stats: ProgressStats = Depends(get_progress_stats),
):
    """
    What you finished: tasks, steps and focus minutes over the last `days` days (in your time zone), tasks per
    tag, one entry per day, and all-time totals. Counts only ever add up: unticking or deleting a task later
    doesn't take back that you finished it. Nothing goes back to zero, and there are no goals or comparisons.
    """
    try:
        zone = ZoneInfo(tz)
    except (ZoneInfoNotFoundError, ValueError):
        raise HTTPException(status_code=422, detail="That time zone isn't one Pebble knows.") from None
    return stats_data(await stats.summary(user_id, days, zone))


@router.post("/focus", status_code=status.HTTP_204_NO_CONTENT, summary="Note a focus session")
async def add_focus_session(
    body: FocusSession,
    user_id: str = Depends(get_current_user),
    progress: ProgressLog = Depends(get_progress_log),
):
    """A focus session is over: its minutes count towards your progress."""
    await progress.focus(user_id, body.minutes)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
