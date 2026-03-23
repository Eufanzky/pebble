from fastapi import APIRouter, Depends, Query

from app.services.auth import get_current_user_id
from app.services.db import get_container

router = APIRouter()


@router.get("/decisions")
async def list_agent_decisions(
    user_id: str = Depends(get_current_user_id),
    agent: str | None = Query(default=None, description="Filter by agent name"),
    limit: int = Query(default=50, ge=1, le=200),
):
    """
    List all agent decisions for the authenticated user.
    This powers the Activity Feed in the frontend with full explainability.
    """
    container = await get_container("activity")

    if agent:
        query = (
            "SELECT TOP @limit * FROM c "
            "WHERE c.userId = @userId AND c.agent = @agent "
            "ORDER BY c.timestamp DESC"
        )
        params = [
            {"name": "@userId", "value": user_id},
            {"name": "@agent", "value": agent},
            {"name": "@limit", "value": limit},
        ]
    else:
        query = (
            "SELECT TOP @limit * FROM c "
            "WHERE c.userId = @userId "
            "ORDER BY c.timestamp DESC"
        )
        params = [
            {"name": "@userId", "value": user_id},
            {"name": "@limit", "value": limit},
        ]

    items = container.query_items(query=query, parameters=params)
    return [item async for item in items]


@router.get("/agents")
async def list_agents():
    """
    List all available agents and their roles.
    Used by the frontend to explain what each agent does.
    """
    return [
        {
            "name": "CalmSense",
            "role": "Task Decomposition",
            "description": "Breaks tasks into smaller, time-boxed steps that feel achievable",
        },
        {
            "name": "AdaptLens",
            "role": "Preference Adaptation",
            "description": "Adapts content and suggestions based on your accessibility preferences",
        },
        {
            "name": "SimplifyCore",
            "role": "Document Simplification",
            "description": "Simplifies complex text to your preferred reading level",
        },
        {
            "name": "PebbleVoice",
            "role": "Motivation & Orchestration",
            "description": "Pebble's voice — provides encouragement and coordinates other agents",
        },
        {
            "name": "WhyBot",
            "role": "Explainability",
            "description": "Explains why Pebble made a specific decision or simplification",
        },
        {
            "name": "BridgeBot",
            "role": "Focus Room",
            "description": "Manages focus room sessions and provides check-ins",
        },
    ]
