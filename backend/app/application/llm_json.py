"""Reading an agent's JSON reply from the model's text."""

import json
import re

from app.application.errors import AgentReplyError
from app.application.ports.llm import LLMProvider, LLMRequest, LLMResponseError

_FENCE = re.compile(r"^\s*```(?:json)?\s*\n?(.*?)\n?\s*```\s*$", re.DOTALL)


def parse_json_object(text: str) -> dict:
    """Parse a JSON object, tolerating a Markdown code fence around it. Raises ``AgentReplyError``."""
    match = _FENCE.match(text)
    if match:
        text = match.group(1)
    try:
        value = json.loads(text)
    except json.JSONDecodeError as e:
        raise AgentReplyError(f"Not JSON: {e.msg}") from e
    if not isinstance(value, dict):
        raise AgentReplyError(f"Expected a JSON object, got {type(value).__name__}")
    return value


async def ask_json(llm: LLMProvider, request: LLMRequest) -> dict:
    """Ask for a JSON object. An unusable reply, from the host or in the text, is an ``AgentReplyError``."""
    try:
        text = await llm.complete(request)
    except LLMResponseError as e:
        raise AgentReplyError(str(e)) from e
    return parse_json_object(text)
