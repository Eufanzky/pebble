from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.models.schemas import PreferencesUpdate, PreferencesResponse
from app.services.auth import get_current_user_id
from app.services.db import get_container

router = APIRouter()

DEFAULT_PREFERENCES = {
    "readingLevel": 5,
    "chunkSize": "medium",
    "reduceAnimations": False,
    "calmMode": False,
    "pebbleColor": "lavender",
    "pebblePersonality": "gentle",
    "pebbleModel": "classic",
    "voiceInput": False,
}

PREFERENCES_DOC_ID = "preferences"


@router.get("", response_model=PreferencesResponse)
async def get_preferences(user_id: str = Depends(get_current_user_id)):
    """Get user preferences. Creates defaults if none exist."""
    container = await get_container("preferences")

    try:
        item = await container.read_item(PREFERENCES_DOC_ID, partition_key=user_id)
        return item
    except Exception:
        # First time — create default preferences
        doc = {
            "id": PREFERENCES_DOC_ID,
            "userId": user_id,
            **DEFAULT_PREFERENCES,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
        result = await container.create_item(doc)
        return result


@router.put("", response_model=PreferencesResponse)
async def update_preferences(
    body: PreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """Update user preferences."""
    container = await get_container("preferences")

    try:
        existing = await container.read_item(PREFERENCES_DOC_ID, partition_key=user_id)
    except Exception:
        existing = {
            "id": PREFERENCES_DOC_ID,
            "userId": user_id,
            **DEFAULT_PREFERENCES,
        }

    updates = body.model_dump(by_alias=True, exclude_none=True)
    existing.update(updates)
    existing["updatedAt"] = datetime.now(timezone.utc).isoformat()

    result = await container.upsert_item(existing)
    return result
