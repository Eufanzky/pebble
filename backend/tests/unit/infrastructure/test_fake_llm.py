"""The scripted fake LLM that tests and ``LLM_PROVIDER=fake`` use."""

import json

import pytest

from app.application.ports.llm import LLMRequest, LLMUnavailableError
from app.infrastructure.llm.fake import FakeLLM


def request(agent: str, message: str) -> LLMRequest:
    return LLMRequest(agent=agent, system_prompt="system", user_message=message)


async def test_scripted_dict_is_sent_as_json_and_the_call_is_recorded():
    llm = FakeLLM()
    llm.script("orchestrator", {"intent": "chat"})

    reply = await llm.complete(request("orchestrator", "Hi"))

    assert json.loads(reply) == {"intent": "chat"}
    assert llm.agents_called() == ["orchestrator"]
    assert llm.sent_text() == "Hi"


async def test_scripted_string_is_sent_as_is():
    llm = FakeLLM()
    llm.script("CalmSense", "not json")

    assert await llm.complete(request("CalmSense", "x")) == "not json"


async def test_scripted_exception_is_raised():
    llm = FakeLLM()
    llm.script("PebbleVoice", LLMUnavailableError("down"))

    with pytest.raises(LLMUnavailableError):
        await llm.complete(request("PebbleVoice", "x"))


@pytest.mark.parametrize(
    ("message", "intent"),
    [
        ("I'm so overwhelmed", "distress"),
        ("I can’t do this", "distress"),
        ("Break down my essay", "decompose"),
        ("Can you simplify this text?", "simplify"),
        ("I need some encouragement", "motivate"),
        ("Hello Pebble", "chat"),
    ],
)
async def test_default_classifier_picks_an_intent_by_keyword(message, intent):
    reply = json.loads(await FakeLLM().complete(request("orchestrator", message)))

    assert reply["intent"] == intent
    assert reply["response"]
    assert reply["mood"] in {"sleepy", "normal", "happy", "excited"}


async def test_default_decompose_uses_the_task_and_chunk_size():
    message = "Task: Clean my room\nUser's preferred chunk size: small\nCurrent time of day: day"

    reply = json.loads(await FakeLLM().complete(request("CalmSense", message)))

    assert len(reply["subtasks"]) == 3
    assert "Clean my room" in reply["subtasks"][0]["title"]
    assert reply["subtasks"][1]["timeEstimate"] == "~5 min"
    assert reply["whyExplanation"]


async def test_default_simplify_keeps_the_first_two_sentences():
    message = "Target reading level: 3/10\n\nDocument text:\nOne. Two! Three?"

    reply = json.loads(await FakeLLM().complete(request("SimplifyCore", message)))

    assert reply["simplified"] == "One. Two!"
    assert set(reply) == {"simplified", "extractedTasks", "tags", "whyExplanation"}


@pytest.mark.parametrize(
    ("done", "expected"),
    [(0, "Starting small is still starting."), (1, "You finished 1 thing today."), (3, "You finished 3 things")],
)
async def test_default_motivate_is_specific(done, expected):
    reply = json.loads(await FakeLLM().complete(request("PebbleVoice", f"Tasks completed today: {done}/5")))

    assert expected in reply["message"]


async def test_unknown_agent_gets_a_generic_reply():
    assert json.loads(await FakeLLM().complete(request("other", "x"))) == {"response": "I'm here."}
