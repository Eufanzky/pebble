from fastapi import APIRouter, Depends

from app.api.auth import get_current_user_id
from app.api.dependencies import get_decompose_task, get_encourage, get_handle_chat, get_simplify_document
from app.api.presenters import breakdown_data, chat_response, simplification_data
from app.api.schemas.agents import (
    ChatRequest,
    ChatResponse,
    DecomposeRequest,
    DecomposeResponse,
    MotivateRequest,
    MotivateResponse,
    SimplifyRequest,
    SimplifyResponse,
)
from app.application.agents.calmsense import DecomposeTask
from app.application.agents.orchestrator import HandleChat
from app.application.agents.pebblevoice import Encourage
from app.application.agents.simplifycore import SimplifyDocument
from app.domain.chat import ChatContext

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
    decompose_task: DecomposeTask = Depends(get_decompose_task),
):
    """
    **Agent: CalmSense** — Takes a task title and breaks it into smaller, achievable subtasks.

    Respects the user's preferred chunk size:
    - `small`: 5-10 minute steps
    - `medium`: 15-20 minute steps
    - `large`: 30+ minute steps

    The agent starts with the easiest step to reduce task initiation friction,
    and includes a `whyExplanation` describing why it chose this breakdown.

    Input and output go through the safety gate (Content Safety and PII redaction).
    """
    breakdown = await decompose_task(body.task_title, body.chunk_size, body.time_of_day)
    return breakdown_data(breakdown)


@router.post(
    "/simplify",
    response_model=SimplifyResponse,
    summary="Simplify text",
    response_description="Simplified text, extracted tags, action items, and explanation",
)
async def simplify(
    body: SimplifyRequest,
    user_id: str = Depends(get_current_user_id),
    simplify_document: SimplifyDocument = Depends(get_simplify_document),
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
    Output is verified against the original text using Groundedness Detection.
    """
    return simplification_data(await simplify_document(body.text, body.reading_level))


@router.post(
    "/motivate",
    response_model=MotivateResponse,
    summary="Get encouragement",
    response_description="A personalized motivational message and suggested Pebble mood",
)
async def motivate(
    body: MotivateRequest,
    user_id: str = Depends(get_current_user_id),
    encourage: Encourage = Depends(get_encourage),
):
    """
    **Agent: PebbleVoice** — Generates specific, personalized encouragement.

    Never generic platitudes. The agent references the user's actual progress:
    - *"You finished reading that chapter even though you said it felt hard"*
    - *"Starting is the hardest part, and you did that"*

    Returns a `mood` that the frontend uses to update Pebble's expression:
    `sleepy`, `normal`, `happy`, or `excited`.
    """
    encouragement = await encourage(
        ChatContext(
            tasks_completed=body.tasks_completed,
            tasks_total=body.tasks_total,
            recent_task_titles=tuple(body.recent_task_titles),
            time_of_day=body.time_of_day,
            personality=body.personality,
        )
    )
    return {"message": encouragement.message, "mood": str(encouragement.mood)}


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with Pebble",
    response_description="Pebble's response with detected intent, agent used, and optional structured data",
)
async def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    handle_chat: HandleChat = Depends(get_handle_chat),
):
    """
    **Pebble Orchestrator** — The main entry point for talking to Pebble.

    Classifies the user's intent and routes to the appropriate sub-agent:
    - `decompose` → CalmSense (task breakdown)
    - `simplify` → SimplifyCore (text simplification)
    - `motivate` → PebbleVoice (encouragement)
    - `chat` → Direct response from Pebble
    - `distress` → Immediate empathetic response with support

    All input is screened by Prompt Shields (anti-jailbreak) and Content Safety, then PII-redacted:
    the classifier and every sub-agent see only the redacted message. A flagged reply is replaced
    with a safe one.

    If the user expresses distress (*"I'm overwhelmed"*, *"I can't do this"*),
    Pebble responds with empathy and offers to simplify their day.

    The `data` field contains structured output from the sub-agent (e.g., subtasks
    for decompose, simplified text for simplify), or `null` for chat/distress.
    """
    context = ChatContext(
        tasks_completed=body.tasks_completed,
        tasks_total=body.tasks_total,
        recent_task_titles=tuple(body.recent_task_titles),
        chunk_size=body.chunk_size,
        reading_level=body.reading_level,
        time_of_day=body.time_of_day,
        personality=body.personality,
    )
    return chat_response(await handle_chat(body.message, context))
