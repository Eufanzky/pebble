from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import JSONResponse

from app.api.auth import get_current_user
from app.api.dependencies import get_delete_account, get_export_account_data
from app.application.account import DeleteAccount, ExportAccountData

router = APIRouter()


@router.get("/export", summary="Download all your data")
async def export_account_data(
    user_id: str = Depends(get_current_user),
    export: ExportAccountData = Depends(get_export_account_data),
):
    """
    Everything Pebble stores about you, as one JSON file: every row of every table that belongs to you
    (tasks, their steps, preferences, the activity log). Uploaded documents are never stored, so they
    aren't in it.
    """
    return JSONResponse(
        await export(user_id),
        headers={"Content-Disposition": 'attachment; filename="pebble-data.json"', "Cache-Control": "no-store"},
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT, summary="Delete your account")
async def delete_account(
    user_id: str = Depends(get_current_user),
    delete: DeleteAccount = Depends(get_delete_account),
):
    """Deletes everything Pebble stores about you, in every table, for good. Signing in again starts afresh."""
    await delete(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
