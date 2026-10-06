from fastapi import APIRouter, Depends, Response, status

from app.api.auth import get_current_user
from app.api.dependencies import get_adaptlens
from app.api.presenters import preferences_data, suggestion_data
from app.api.schemas.preferences import PreferencesOut
from app.api.schemas.suggestions import SuggestionAnswer, SuggestionOut
from app.application.adaptation import AdaptLens

router = APIRouter()


@router.get("", response_model=SuggestionOut | None, summary="AdaptLens's suggestion, if any")
async def current_suggestion(user_id: str = Depends(get_current_user), adaptlens: AdaptLens = Depends(get_adaptlens)):
    """One preference change AdaptLens suggests from how you use Pebble, with what it noticed; or null.

    Nothing changes until you accept it.
    """
    suggestion = await adaptlens.current(user_id)
    return suggestion_data(suggestion) if suggestion else None


@router.post("/accept", response_model=PreferencesOut, summary="Accept the suggestion")
async def accept_suggestion(
    body: SuggestionAnswer, user_id: str = Depends(get_current_user), adaptlens: AdaptLens = Depends(get_adaptlens)
):
    """Apply it and return your preferences. If it isn't the current suggestion any more, 409 and nothing changes."""
    return preferences_data(await adaptlens.accept(user_id, body.key))


@router.post("/dismiss", status_code=status.HTTP_204_NO_CONTENT, summary="Not now")
async def dismiss_suggestion(
    body: SuggestionAnswer, user_id: str = Depends(get_current_user), adaptlens: AdaptLens = Depends(get_adaptlens)
):
    """It won't be suggested again for 14 days."""
    await adaptlens.dismiss(user_id, body.key)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
