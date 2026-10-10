"""Wiring: builds the adapters from the settings and hands use cases to the routers.

``get_container()`` builds everything on first use. Tests install their own
container with fakes through ``set_container()``.
"""

from dataclasses import dataclass, field
from datetime import timedelta

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncEngine

from app.api.auth import get_current_user
from app.application.account import DeleteAccount, ExportAccountData
from app.application.activity import ActivityLog
from app.application.adaptation import AdaptLens, UsageSignals
from app.application.agents.calmsense import DecomposeTask
from app.application.agents.orchestrator import HandleChat
from app.application.agents.pebblevoice import Encourage
from app.application.agents.simplifycore import SimplifyDocument
from app.application.agents.whybot import Explain
from app.application.breakdown import BreakDownTask
from app.application.calendar import ExportPlan
from app.application.documents import ParseDocument
from app.application.importing import ImportLocalData
from app.application.ports.account import AccountDataStore
from app.application.ports.activity import ActivityRepository
from app.application.ports.adaptation import AdaptationRepository
from app.application.ports.documents import DocumentParser
from app.application.ports.llm import LLMProvider
from app.application.ports.preferences import PreferencesRepository
from app.application.ports.progress import ProgressRepository
from app.application.ports.reader import ReaderTokenProvider
from app.application.ports.safety import PIIRedactor, SafetyChecker
from app.application.ports.tasks import TaskRepository
from app.application.preferences import UserPreferences
from app.application.progress import ProgressLog, ProgressStats
from app.application.rate_limit import AgentCallLimit
from app.application.safety import SafetyGate
from app.application.tasks import Tasks
from app.domain.rate_limit import RateLimit
from app.infrastructure.calendar.ics import IcsCalendarWriter
from app.infrastructure.config import Settings, settings
from app.infrastructure.db.account import SqlAccountDataStore, UnconfiguredAccountDataStore
from app.infrastructure.db.activity import SqlActivityRepository, UnconfiguredActivityRepository
from app.infrastructure.db.adaptation import SqlAdaptationRepository, UnconfiguredAdaptationRepository
from app.infrastructure.db.engine import build_engine, build_sessions
from app.infrastructure.db.preferences import SqlPreferencesRepository, UnconfiguredPreferencesRepository
from app.infrastructure.db.progress import SqlProgressRepository, UnconfiguredProgressRepository
from app.infrastructure.db.tasks import SqlTaskRepository, UnconfiguredTaskRepository
from app.infrastructure.llm.factory import build_llm_provider
from app.infrastructure.parsing.local_document_parser import LocalDocumentParser
from app.infrastructure.pii.regex_redactor import RegexPIIRedactor
from app.infrastructure.reader.azure_immersive_reader import UnconfiguredReader, build_reader
from app.infrastructure.safety.factory import build_safety_checker


@dataclass
class Container:
    llm: LLMProvider
    safety_checker: SafetyChecker
    pii_redactor: PIIRedactor = field(default_factory=RegexPIIRedactor)
    document_parser: DocumentParser = field(default_factory=LocalDocumentParser)
    reader: ReaderTokenProvider = field(default_factory=UnconfiguredReader)
    task_repository: TaskRepository = field(default_factory=UnconfiguredTaskRepository)
    preferences_repository: PreferencesRepository = field(default_factory=UnconfiguredPreferencesRepository)
    activity_repository: ActivityRepository = field(default_factory=UnconfiguredActivityRepository)
    account_data: AccountDataStore = field(default_factory=UnconfiguredAccountDataStore)
    progress_repository: ProgressRepository = field(default_factory=UnconfiguredProgressRepository)
    adaptation_repository: AdaptationRepository = field(default_factory=UnconfiguredAdaptationRepository)
    # No limit unless the settings set one (tests that need one build their own)
    agent_call_limit: AgentCallLimit = field(default_factory=AgentCallLimit)
    engine: AsyncEngine | None = None

    @classmethod
    def from_settings(cls, config: Settings) -> "Container":
        container = cls(
            llm=build_llm_provider(config),
            safety_checker=build_safety_checker(config),
            reader=build_reader(config),
            agent_call_limit=AgentCallLimit(
                (
                    RateLimit(config.agent_calls_per_minute, timedelta(minutes=1)),
                    RateLimit(config.agent_calls_per_day, timedelta(days=1)),
                )
            ),
        )
        if config.database_url:
            container.engine = build_engine(config.database_url)
            sessions = build_sessions(container.engine)
            container.task_repository = SqlTaskRepository(sessions)
            container.preferences_repository = SqlPreferencesRepository(sessions)
            container.activity_repository = SqlActivityRepository(sessions)
            container.account_data = SqlAccountDataStore(sessions)
            container.progress_repository = SqlProgressRepository(sessions)
            container.adaptation_repository = SqlAdaptationRepository(sessions)
        return container

    @property
    def gate(self) -> SafetyGate:
        return SafetyGate(self.safety_checker, self.pii_redactor)

    @property
    def activity(self) -> ActivityLog:
        return ActivityLog(self.activity_repository)

    @property
    def whybot(self) -> Explain:
        return Explain(self.llm, self.gate)

    @property
    def decompose_task(self) -> DecomposeTask:
        return DecomposeTask(self.llm, self.gate, self.activity, self.whybot)

    @property
    def simplify_document(self) -> SimplifyDocument:
        return SimplifyDocument(self.llm, self.gate, self.activity, self.whybot, self.usage_signals)

    @property
    def encourage(self) -> Encourage:
        return Encourage(self.llm, self.gate, self.activity, self.whybot)

    @property
    def parse_document(self) -> ParseDocument:
        return ParseDocument(self.document_parser)

    @property
    def tasks(self) -> Tasks:
        return Tasks(self.task_repository, progress=self.progress_log, signals=self.usage_signals)

    @property
    def break_down_task(self) -> BreakDownTask:
        return BreakDownTask(self.tasks, self.decompose_task, self.preferences)

    @property
    def export_plan(self) -> ExportPlan:
        return ExportPlan(self.tasks, IcsCalendarWriter(), self.activity)

    @property
    def usage_signals(self) -> UsageSignals:
        return UsageSignals(self.adaptation_repository)

    @property
    def adaptlens(self) -> AdaptLens:
        return AdaptLens(self.adaptation_repository, self.preferences, self.activity, self.whybot)

    @property
    def progress_log(self) -> ProgressLog:
        return ProgressLog(self.progress_repository)

    @property
    def progress_stats(self) -> ProgressStats:
        return ProgressStats(self.progress_repository)

    @property
    def preferences(self) -> UserPreferences:
        return UserPreferences(self.preferences_repository)

    @property
    def import_local_data(self) -> ImportLocalData:
        return ImportLocalData(self.tasks, self.preferences, self.activity)

    @property
    def export_account_data(self) -> ExportAccountData:
        return ExportAccountData(self.account_data)

    @property
    def delete_account(self) -> DeleteAccount:
        return DeleteAccount(self.account_data)

    @property
    def handle_chat(self) -> HandleChat:
        return HandleChat(
            self.llm,
            self.gate,
            self.decompose_task,
            self.simplify_document,
            self.encourage,
            self.activity,
            self.whybot,
        )

    async def aclose(self) -> None:
        for adapter in (self.llm, self.safety_checker):
            close = getattr(adapter, "aclose", None)
            if close is not None:
                await close()
        if self.engine is not None:
            await self.engine.dispose()


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


def get_reader() -> ReaderTokenProvider:
    return get_container().reader


def get_tasks() -> Tasks:
    return get_container().tasks


def get_break_down_task() -> BreakDownTask:
    return get_container().break_down_task


def get_export_plan() -> ExportPlan:
    return get_container().export_plan


def get_adaptlens() -> AdaptLens:
    return get_container().adaptlens


def get_preferences() -> UserPreferences:
    return get_container().preferences


def get_activity() -> ActivityLog:
    return get_container().activity


def get_import_local_data() -> ImportLocalData:
    return get_container().import_local_data


def get_export_account_data() -> ExportAccountData:
    return get_container().export_account_data


def get_delete_account() -> DeleteAccount:
    return get_container().delete_account


def get_progress_log() -> ProgressLog:
    return get_container().progress_log


def get_progress_stats() -> ProgressStats:
    return get_container().progress_stats


def limit_agent_calls(user_id: str = Depends(get_current_user)) -> None:
    """One agent call for this user (10.4): over the limit, a 429 with ``Retry-After``."""
    get_container().agent_call_limit.take(user_id)
