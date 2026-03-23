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


@router.post(
    "/decompose",
    response_model=DecomposeResponse,
    summary="Break down a task",
    response_description="Time-boxed subtasks with an explanation of why they were split this way",
)
async def decompose(
    body: DecomposeRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    **Agent: CalmSense** — Takes a task title and breaks it into smaller, achievable subtasks.

    Respects the user's preferred chunk size:
    - `small`: 5-10 minute steps
    - `medium`: 15-20 minute steps
    - `large`: 30+ minute steps

    The agent starts with the easiest step to reduce task initiation friction,
    and includes a `whyExplanation` describing why it chose this breakdown.

    Both input and output are filtered through Azure Content Safety.
    """
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


@router.post(
    "/simplify",
    response_model=SimplifyResponse,
    summary="Simplify text",
    response_description="Simplified text, extracted tags, action items, and explanation",
)
async def simplify(
    body: SimplifyRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    **Agent: SimplifyCore** — Simplifies complex text to a target reading level (1-10).

    Reading level scale:
    - **1-3**: Very short sentences, common words only
    - **4-6**: Clear language, some compound sentences
    - **7-9**: Closer to original, simplified structure
    - **10**: Minimal changes, just improved clarity

    Also extracts action items (`extractedTasks`) and topic tags from the text.
    Includes a `whyExplanation` describing what was changed and why.
    """
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


@router.post(
    "/motivate",
    response_model=MotivateResponse,
    summary="Get encouragement",
    response_description="A personalized motivational message and suggested Pebble mood",
)
async def motivate(
    body: MotivateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    **Agent: PebbleVoice** — Generates specific, personalized encouragement.

    Never generic platitudes. The agent references the user's actual progress:
    - *"You finished reading that chapter even though you said it felt hard"*
    - *"Starting is the hardest part, and you did that"*

    Returns a `mood` that the frontend uses to update Pebble's expression:
    `sleepy`, `normal`, `happy`, or `excited`.
    """
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


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with Pebble",
    response_description="Pebble's response with detected intent, agent used, and optional structured data",
)
async def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    **Pebble Orchestrator** — The main entry point for talking to Pebble.

    Classifies the user's intent and routes to the appropriate sub-agent:
    - `decompose` → CalmSense (task breakdown)
    - `simplify` → SimplifyCore (text simplification)
    - `motivate` → PebbleVoice (encouragement)
    - `chat` → Direct response from Pebble
    - `distress` → Immediate empathetic response with support

    If the user expresses distress (*"I'm overwhelmed"*, *"I can't do this"*),
    Pebble responds with empathy and offers to simplify their day.

    The `data` field contains structured output from the sub-agent (e.g., subtasks
    for decompose, simplified text for simplify), or `null` for chat/distress.
    """
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
