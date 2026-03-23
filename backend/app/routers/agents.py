from fastapi import APIRouter, Depends, HTTPException

from app.models.agent_schemas import (
    ChatRequest,
    ChatResponse,
    DecomposeRequest,
    DecomposeResponse,
    MotivateRequest,
    MotivateResponse,
    SimplifyRequest,
    SimplifyResponse,
)
from app.agents.task_decomposition import decompose_task
from app.agents.document_simplification import simplify_document
from app.agents.motivation import generate_motivation
from app.agents.orchestrator import handle_chat
from app.services.auth import get_current_user_id

router = APIRouter()


@router.post("/decompose", response_model=DecomposeResponse)
async def decompose(
    body: DecomposeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Break a task into time-boxed subtasks using the Task Decomposition Agent."""
    try:
        result = await decompose_task(
            task_title=body.task_title,
            chunk_size=body.chunk_size,
            time_of_day=body.time_of_day,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")


@router.post("/simplify", response_model=SimplifyResponse)
async def simplify(
    body: SimplifyRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Simplify document text using the Document Simplification Agent."""
    try:
        result = await simplify_document(
            text=body.text,
            reading_level=body.reading_level,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")


@router.post("/motivate", response_model=MotivateResponse)
async def motivate(
    body: MotivateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate personalized encouragement using the Motivation Agent."""
    try:
        result = await generate_motivation(
            tasks_completed=body.tasks_completed,
            tasks_total=body.tasks_total,
            recent_task_titles=body.recent_task_titles,
            time_of_day=body.time_of_day,
            personality=body.personality,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Send a message to Pebble. The orchestrator routes to the right agent."""
    try:
        result = await handle_chat(
            user_message=body.message,
            tasks_completed=body.tasks_completed,
            tasks_total=body.tasks_total,
            recent_task_titles=body.recent_task_titles,
            chunk_size=body.chunk_size,
            reading_level=body.reading_level,
            time_of_day=body.time_of_day,
            personality=body.personality,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")
