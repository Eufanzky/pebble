from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.api.dependencies import get_preferences
from app.api.presenters import preferences_data
from app.api.schemas.preferences import PreferencesOut, PreferencesUpdate
from app.application.preferences import UserPreferences

router = APIRouter()


@router.get("", response_model=PreferencesOut, summary="Your preferences")
async def get_preferences_(
    user_id: str = Depends(get_current_user), preferences: UserPreferences = Depends(get_preferences)
):
    """Your saved preferences over the defaults. A new account gets the defaults."""
    return preferences_data(await preferences.get(user_id))


@router.patch("", response_model=PreferencesOut, summary="Change some preferences")
async def update_preferences(
    body: PreferencesUpdate,
    user_id: str = Depends(get_current_user),
    preferences: UserPreferences = Depends(get_preferences),
):
    """Change only the fields you send, for example `{"calmMode": true}`. Returns all of them."""
    changes = {name: value for name, value in body.model_dump(exclude_unset=True).items() if value is not None}
    return preferences_data(await preferences.update(user_id, changes))
