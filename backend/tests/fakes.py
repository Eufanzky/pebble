"""Test doubles for the services behind the agent pipeline.

The LLM is faked at the Python seam, not over HTTP: the ``openai`` SDK sends
requests through its own vendored ``httpx2``, which respx can't intercept.
Content Safety text analysis is faked the same way, because its Azure SDK
client uses aiohttp. Prompt Shields and Groundedness Detection use plain
``httpx`` and are faked with respx in ``conftest.py``.
"""

import json
from dataclasses import dataclass, field
from types import SimpleNamespace

from app.agents.prompts import (
    DOCUMENT_SIMPLIFICATION_PROMPT,
    MOTIVATION_PROMPT,
    ORCHESTRATOR_PROMPT,
    TASK_DECOMPOSITION_PROMPT,
)

# Which agent a system prompt belongs to.
_AGENT_BY_PROMPT = {
    ORCHESTRATOR_PROMPT: "orchestrator",
    TASK_DECOMPOSITION_PROMPT: "decompose",
    DOCUMENT_SIMPLIFICATION_PROMPT: "simplify",
    MOTIVATION_PROMPT: "motivate",
}


@dataclass
class LLMCall:
    agent: str
    """``orchestrator``, ``decompose``, ``simplify`` or ``motivate``."""
    via: str
    """``kernel`` (Semantic Kernel) or ``openai`` (direct chat completion)."""
    user_message: str
    temperature: float | None = None
    max_tokens: int | None = None


@dataclass
class FakeLLM:
    """A scripted LLM. Each agent answers with its scripted reply and every call is recorded.

    A reply is a dict (sent as JSON), a raw string (sent as is), or an exception (raised).
    """

    replies: dict[str, object] = field(default_factory=dict)
    kernel_error: Exception | None = None
    calls: list[LLMCall] = field(default_factory=list)

    def script(self, agent: str, reply: object) -> None:
        self.replies[agent] = reply

    def _answer(self, agent: str) -> str:
        reply = self.replies[agent]
        if isinstance(reply, Exception):
            raise reply
        return reply if isinstance(reply, str) else json.dumps(reply)

    # Stands in for the Semantic Kernel returned by ``get_kernel()``.
    async def invoke_prompt(self, prompt: str, input: str) -> str:
        assert prompt.startswith(ORCHESTRATOR_PROMPT), "only the orchestrator goes through Semantic Kernel"
        self.calls.append(LLMCall(agent="orchestrator", via="kernel", user_message=input))
        if self.kernel_error is not None:
            raise self.kernel_error
        return self._answer("orchestrator")

    # Stands in for ``client.chat.completions.create`` on the client from ``get_openai_client()``.
    async def _create(self, *, model, messages, temperature, max_tokens):
        system, user = messages[0]["content"], messages[1]["content"]
        agent = _AGENT_BY_PROMPT[system]
        self.calls.append(
            LLMCall(agent=agent, via="openai", user_message=user, temperature=temperature, max_tokens=max_tokens)
        )
        content = self._answer(agent)
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])

    @property
    def openai_client(self) -> SimpleNamespace:
        return SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=self._create)))

    def agents_called(self) -> list[str]:
        return [call.agent for call in self.calls]

    def sent_text(self) -> str:
        """Everything the LLM received, joined, for "never saw X" assertions."""
        return "\n".join(call.user_message for call in self.calls)


@dataclass
class FakeContentSafety:
    """Stands in for the Azure Content Safety client. Every text scores 0 unless flagged."""

    flags: list[tuple[str, str, int]] = field(default_factory=list)
    analyzed: list[str] = field(default_factory=list)

    def flag(self, text_contains: str, category: str = "Violence", severity: int = 2) -> None:
        """Score any text containing ``text_contains`` at ``severity`` in ``category``."""
        self.flags.append((text_contains, category, severity))

    async def analyze_text(self, request) -> SimpleNamespace:
        self.analyzed.append(request.text)
        severities = {"Hate": 0, "SelfHarm": 0, "Sexual": 0, "Violence": 0}
        for needle, category, severity in self.flags:
            if needle in request.text:
                severities[category] = max(severities[category], severity)
        return SimpleNamespace(
            categories_analysis=[
                SimpleNamespace(category=category, severity=severity) for category, severity in severities.items()
            ]
        )
