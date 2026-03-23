import uuid
from datetime import datetime, timezone

from azure.cosmos.exceptions import CosmosHttpResponseError
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.focus_schemas import (
    FocusSessionComplete,
    JoinRoomResponse,
    RoomCreate,
    RoomResponse,
    TimerAction,
    TimerState,
)
from app.services.auth import get_current_user_id
from app.services.db import get_container
from app.services.webpubsub import get_client_access_url, send_to_room
from app.agents.motivation import generate_motivation

router = APIRouter()

FOCUS_DURATION_SECONDS = 25 * 60  # 25 min Pomodoro


@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    body: RoomCreate,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new focus room."""
    now = datetime.now(timezone.utc).isoformat()
    room = {
        "id": str(uuid.uuid4()),
        "userId": user_id,  # partition key
        "name": body.name,
        "description": body.description,
        "createdBy": user_id,
        "participantCount": 1,
        "isActive": True,
        "createdAt": now,
    }

    container = await get_container("rooms")
    await container.create_item(room)
    return room


@router.get("/rooms", response_model=list[RoomResponse])
async def list_rooms(user_id: str = Depends(get_current_user_id)):
    """List all active focus rooms."""
    container = await get_container("rooms")
    query = "SELECT * FROM c WHERE c.isActive = true ORDER BY c.createdAt DESC"
    items = container.query_items(
        query=query,
        enable_cross_partition_query=True,
    )
    return [item async for item in items]


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a focus room by ID."""
    container = await get_container("rooms")
    # Rooms need cross-partition read since any user can access any room
    query = "SELECT * FROM c WHERE c.id = @roomId"
    items = container.query_items(
        query=query,
        parameters=[{"name": "@roomId", "value": room_id}],
        enable_cross_partition_query=True,
    )
    results = [item async for item in items]
    if not results:
        raise HTTPException(status_code=404, detail="Room not found")
    return results[0]


@router.post("/rooms/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(
    room_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Join a focus room. Returns a WebSocket URL for real-time presence.
    """
    # Verify room exists
    container = await get_container("rooms")
    query = "SELECT * FROM c WHERE c.id = @roomId"
    items = container.query_items(
        query=query,
        parameters=[{"name": "@roomId", "value": room_id}],
        enable_cross_partition_query=True,
    )
    results = [item async for item in items]
    if not results:
        raise HTTPException(status_code=404, detail="Room not found")

    room = results[0]

    # Get WebSocket URL with token
    try:
        ws_url = get_client_access_url(user_id=user_id, room_id=room_id)
    except Exception:
        # If Web PubSub not configured, return placeholder
        ws_url = ""

    # Broadcast join event to room
    try:
        send_to_room(room_id, {
            "type": "user_joined",
            "userId": user_id,
            "roomId": room_id,
        })
    except Exception:
        pass  # Non-critical

    # Increment participant count
    room["participantCount"] = room.get("participantCount", 0) + 1
    await container.replace_item(room["id"], room, partition_key=room["userId"])

    return {
        "roomId": room_id,
        "websocketUrl": ws_url,
        "message": f"Joined {room['name']}. Pebble is here with you.",
    }


@router.post("/rooms/{room_id}/leave")
async def leave_room(
    room_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Leave a focus room."""
    container = await get_container("rooms")
    query = "SELECT * FROM c WHERE c.id = @roomId"
    items = container.query_items(
        query=query,
        parameters=[{"name": "@roomId", "value": room_id}],
        enable_cross_partition_query=True,
    )
    results = [item async for item in items]
    if not results:
        raise HTTPException(status_code=404, detail="Room not found")

    room = results[0]
    room["participantCount"] = max(0, room.get("participantCount", 1) - 1)
    await container.replace_item(room["id"], room, partition_key=room["userId"])

    try:
        send_to_room(room_id, {
            "type": "user_left",
            "userId": user_id,
            "roomId": room_id,
        })
    except Exception:
        pass

    return {"message": "Left the room. See you next time."}


@router.post("/rooms/{room_id}/timer", response_model=TimerState)
async def control_timer(
    room_id: str,
    body: TimerAction,
    user_id: str = Depends(get_current_user_id),
):
    """Start, pause, or reset the Pomodoro timer for a room."""
    if body.action == "start":
        timer_state = {
            "roomId": room_id,
            "status": "running",
            "remainingSeconds": FOCUS_DURATION_SECONDS,
            "startedBy": user_id,
        }
    elif body.action == "pause":
        timer_state = {
            "roomId": room_id,
            "status": "paused",
            "remainingSeconds": FOCUS_DURATION_SECONDS,
            "startedBy": None,
        }
    else:  # reset
        timer_state = {
            "roomId": room_id,
            "status": "idle",
            "remainingSeconds": FOCUS_DURATION_SECONDS,
            "startedBy": None,
        }

    # Broadcast timer state to all room participants
    try:
        send_to_room(room_id, {
            "type": "timer_update",
            **timer_state,
        })
    except Exception:
        pass

    return timer_state


@router.post("/rooms/{room_id}/complete", response_model=FocusSessionComplete)
async def complete_session(
    room_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Called when a Pomodoro session completes. Logs activity and
    generates a motivational message via the Motivation Agent.
    """
    # Log the focus session as an activity
    activity_container = await get_container("activity")
    await activity_container.create_item({
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "agent": "PebbleVoice",
        "action": f"Completed 25-minute focus session in room {room_id}",
        "reasoning": "User completed a full Pomodoro timer session",
        "safetyStatus": "passed",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Generate motivational message
    try:
        motivation = await generate_motivation(
            tasks_completed=0,
            tasks_total=0,
            recent_task_titles=["25-minute focus session"],
            time_of_day="day",
            personality="gentle",
        )
        message = motivation["message"]
        mood = motivation["mood"]
    except Exception:
        message = "Great session! You focused for 25 minutes. That's real progress."
        mood = "excited"

    # Broadcast session complete to room
    try:
        send_to_room(room_id, {
            "type": "session_complete",
            "userId": user_id,
            "message": message,
        })
    except Exception:
        pass

    return {
        "roomId": room_id,
        "durationMinutes": 25,
        "message": message,
        "mood": mood,
    }
