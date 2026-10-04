import pytest

from app.application.errors import AgentReplyError
from app.application.llm_json import ask_json, parse_json_object
from app.application.ports.llm import LLMRequest, LLMResponseError, LLMUnavailableError
from app.infrastructure.llm.fake import FakeLLM


@pytest.mark.parametrize(
    "text",
    ['{"a": 1}', '```json\n{"a": 1}\n```', '```\n{"a": 1}\n```', '  ```json {"a": 1} ```  '],
)
def test_parses_plain_and_fenced_objects(text):
    assert parse_json_object(text) == {"a": 1}


@pytest.mark.parametrize("text", ["", "hello", "[1]", '"a"', "```json\nnope\n```"])
def test_rejects_anything_else(text):
    with pytest.raises(AgentReplyError):
        parse_json_object(text)


REQUEST = LLMRequest(agent="CalmSense", system_prompt="s", user_message="u")


async def test_ask_json_returns_the_object():
    llm = FakeLLM()
    llm.script("CalmSense", {"a": 1})

    assert await ask_json(llm, REQUEST) == {"a": 1}


@pytest.mark.parametrize("reply", ["not json", LLMResponseError("the LLM's reply wasn't valid JSON")])
async def test_ask_json_unusable_replies_are_agent_reply_errors(reply):
    llm = FakeLLM()
    llm.script("CalmSense", reply)

    with pytest.raises(AgentReplyError):
        await ask_json(llm, REQUEST)


async def test_ask_json_lets_outages_through():
    llm = FakeLLM()
    llm.script("CalmSense", LLMUnavailableError("down"))

    with pytest.raises(LLMUnavailableError):
        await ask_json(llm, REQUEST)
