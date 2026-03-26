import time
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.config import settings

logger = logging.getLogger("focusbuddy.verify")

router = APIRouter()


@router.get("/services", summary="Test all Azure service connections")
async def verify_services():
    """Run minimal test calls against each configured Azure service. Dev mode only."""
    if not settings.dev_mode:
        raise HTTPException(status_code=404)

    results = {}

    # 1. Cosmos DB
    results["cosmos_db"] = await _test_service("Cosmos DB", _test_cosmos)

    # 2. Content Safety
    results["content_safety"] = await _test_service("Content Safety", _test_content_safety)

    # 3. Prompt Shields
    results["prompt_shields"] = await _test_service("Prompt Shields", _test_prompt_shields)

    # 4. Azure OpenAI
    results["azure_openai"] = await _test_service("Azure OpenAI", _test_openai)

    # 5. Groundedness Detection
    results["groundedness"] = await _test_service("Groundedness", _test_groundedness)

    return {
        "services": results,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def _test_service(name: str, test_fn) -> dict:
    start = time.perf_counter()
    try:
        await test_fn()
        return {"status": "ok", "latency_ms": round((time.perf_counter() - start) * 1000)}
    except Exception as e:
        return {"status": "error", "error": str(e), "latency_ms": round((time.perf_counter() - start) * 1000)}


async def _test_cosmos():
    from app.services.db import get_container
    container = await get_container("tasks")
    # Just verify connection, don't read data
    return True


async def _test_content_safety():
    from app.services.content_safety import check_text_safety
    result = await check_text_safety("Hello, this is a safe test message.")
    assert result["safe"], "Unexpected: safe text flagged"


async def _test_prompt_shields():
    from app.services.content_safety import check_prompt_shield
    result = await check_prompt_shield("What is the weather today?")
    # Normal question should not be flagged
    return result


async def _test_openai():
    from app.services.openai_client import chat_completion
    result = await chat_completion(
        system_prompt="Reply with exactly: OK",
        user_message="Test",
        temperature=0,
        max_tokens=5,
    )
    assert len(result) > 0, "Empty response from OpenAI"


async def _test_groundedness():
    from app.services.content_safety import check_groundedness
    result = await check_groundedness(
        llm_output="The sky is blue.",
        grounding_sources=["The sky is blue during clear weather."],
    )
    return result
