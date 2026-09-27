"""Wiring: builds the adapters from the settings and hands use cases to the routers.

``get_container()`` builds everything on first use. Tests install their own
container with fakes through ``set_container()``.
"""

from dataclasses import dataclass, field

from app.application.agents.calmsense import DecomposeTask
from app.application.agents.orchestrator import HandleChat
from app.application.agents.pebblevoice import Encourage
from app.application.agents.simplifycore import SimplifyDocument
from app.application.documents import ParseDocument
from app.application.ports.documents import DocumentParser
from app.application.ports.llm import LLMProvider
from app.application.ports.safety import PIIRedactor, SafetyChecker
from app.application.safety import SafetyGate
from app.infrastructure.config import Settings, settings
from app.infrastructure.llm.factory import build_llm_provider
from app.infrastructure.parsing.local_parser import LocalDocumentParser
from app.infrastructure.pii.regex_redactor import RegexPIIRedactor
from app.infrastructure.safety.factory import build_safety_checker


@dataclass
class Container:
    llm: LLMProvider
    safety_checker: SafetyChecker
    pii_redactor: PIIRedactor = field(default_factory=RegexPIIRedactor)
    document_parser: DocumentParser = field(default_factory=LocalDocumentParser)

    @classmethod
    def from_settings(cls, config: Settings) -> "Container":
        return cls(llm=build_llm_provider(config), safety_checker=build_safety_checker(config))

    @property
    def gate(self) -> SafetyGate:
        return SafetyGate(self.safety_checker, self.pii_redactor)

    @property
    def decompose_task(self) -> DecomposeTask:
        return DecomposeTask(self.llm, self.gate)

    @property
    def simplify_document(self) -> SimplifyDocument:
        return SimplifyDocument(self.llm, self.gate)

    @property
    def encourage(self) -> Encourage:
        return Encourage(self.llm, self.gate)

    @property
    def parse_document(self) -> ParseDocument:
        return ParseDocument(self.document_parser)

    @property
    def handle_chat(self) -> HandleChat:
        return HandleChat(self.llm, self.gate, self.decompose_task, self.simplify_document, self.encourage)

    async def aclose(self) -> None:
        for adapter in (self.llm, self.safety_checker):
            close = getattr(adapter, "aclose", None)
            if close is not None:
                await close()


_container: Container | None = None


def get_container() -> Container:
    global _container
    if _container is None:
        _container = Container.from_settings(settings)
    return _container


def set_container(container: Container | None) -> None:
    global _container
    _container = container


def get_handle_chat() -> HandleChat:
    return get_container().handle_chat


def get_decompose_task() -> DecomposeTask:
    return get_container().decompose_task


def get_simplify_document() -> SimplifyDocument:
    return get_container().simplify_document


def get_encourage() -> Encourage:
    return get_container().encourage


def get_parse_document() -> ParseDocument:
    return get_container().parse_document
