"""A scripted, offline ``LLMProvider``, selected with ``LLM_PROVIDER=fake``.

Tests script a reply per agent with ``script()`` and read ``calls``. Without a
script, each agent gets a deterministic default reply, so the whole app (and the
E2E suite) runs with no model and no network.
"""

import json
import re
from dataclasses import dataclass, field

from app.application.ports.llm import LLMRequest
from app.domain.agents import AgentName

DISTRESS_WORDS = ("overwhelm", "can't do this", "cant do this", "too much", "give up", "can't cope", "struggling")

# Intent by keyword, checked in order. Anything else is chat.
INTENT_KEYWORDS = (
    ("decompose", ("break", "steps", "split", "plan ")),
    ("simplify", ("simplify", "explain", "summar", "plain words")),
    ("motivate", ("encourag", "motivat", "cheer")),
)

STEP_MINUTES = {"small": 5, "medium": 15, "large": 30}


@dataclass
class FakeLLM:
    replies: dict[str, object] = field(default_factory=dict)
    calls: list[LLMRequest] = field(default_factory=list)

    def script(self, agent: str, reply: object) -> None:
        """Answer ``agent`` with ``reply``: a dict (sent as JSON), a string (sent as is), or an exception (raised)."""
        self.replies[agent] = reply

    async def complete(self, request: LLMRequest) -> str:
        self.calls.append(request)
        reply = self.replies.get(request.agent)
        if reply is None:
            reply = _default_reply(request)
        if isinstance(reply, Exception):
            raise reply
        return reply if isinstance(reply, str) else json.dumps(reply)

    def agents_called(self) -> list[str]:
        return [call.agent for call in self.calls]

    def sent_text(self) -> str:
        """Everything the LLM received, joined, for "never saw X" assertions."""
        return "\n".join(call.user_message for call in self.calls)


def _default_reply(request: LLMRequest) -> dict:
    text = request.user_message
    if request.agent == "orchestrator":
        return _classify(text)
    if request.agent == AgentName.CALM_SENSE:
        return _decompose(text)
    if request.agent == AgentName.SIMPLIFY_CORE:
        return _simplify(text)
    if request.agent == AgentName.PEBBLE_VOICE:
        return _motivate(text)
    return {"response": "I'm here."}


def _classify(message: str) -> dict:
    lower = message.lower().replace("’", "'")
    if any(word in lower for word in DISTRESS_WORDS):
        return {
            "intent": "distress",
            "response": "That sounds like a lot. We can slow down. Want to pick one small thing?",
            "mood": "normal",
        }
    for intent, words in INTENT_KEYWORDS:
        if any(word in lower for word in words):
            return {"intent": intent, "response": "Let's do this together.", "mood": "happy"}
    return {"intent": "chat", "response": "I'm here. What would help right now?", "mood": "normal"}


def _field(text: str, label: str, default: str) -> str:
    match = re.search(rf"^{re.escape(label)}:\s*(.+)$", text, re.MULTILINE)
    return match.group(1).strip() if match else default


def _decompose(text: str) -> dict:
    task = _field(text, "Task", text.strip().splitlines()[0] if text.strip() else "this task")
    minutes = STEP_MINUTES.get(_field(text, "User's preferred step size", "medium"), 15)
    return {
        "title": task[:60],
        "steps": [
            {"title": f"Get what you need for: {task}", "timeEstimate": "~5 min"},
            {"title": f"Do the first small part of: {task}", "timeEstimate": f"~{minutes} min"},
            {"title": "Look at what's left and pick the next part", "timeEstimate": "~5 min"},
        ],
        "whyExplanation": f"I split this into 3 steps of about {minutes} minutes, starting with the easiest.",
    }


def _simplify(text: str) -> dict:
    document = text.split("Document text:", 1)[-1].strip()
    sentences = re.split(r"(?<=[.!?])\s+", document)
    # An action item for each sentence that asks for something to be done
    actions = [s.rstrip(".!?") for s in sentences if re.search(r"\b(must|need to|needs to|should)\b", s, re.I)]
    return {
        "simplified": " ".join(sentences[:2]),
        "extractedTasks": [{"title": a[:120], "timeEstimate": "~15 min", "tag": "project"} for a in actions[:5]],
        "tags": [],
        "whyExplanation": "I kept the first two sentences, which carry the main point.",
    }


def _motivate(text: str) -> dict:
    match = re.search(r"Tasks completed today:\s*(\d+)", text)
    done = int(match.group(1)) if match else 0
    if done:
        things = "thing" if done == 1 else "things"
        return {"message": f"You finished {done} {things} today. That counts.", "mood": "happy"}
    return {"message": "Starting small is still starting. One tiny step is enough.", "mood": "normal"}
