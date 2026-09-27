"""Reading an agent's JSON reply from the model's text."""

import json
import re

from app.application.errors import AgentReplyError

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
