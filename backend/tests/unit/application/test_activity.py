from datetime import UTC, datetime

import pytest

from app.application.activity import MAX_LIMIT, ActivityLog, note, quote, watch
from app.application.errors import UnsafeContentError
from app.application.ports.persistence import PersistenceError
from app.domain.activity import ActivityEntry, SafetyStatus
from app.domain.agents import AgentName
from tests.fakes import InMemoryActivityRepository

NOW = datetime(2026, 9, 29, 9, 30, tzinfo=UTC)


@pytest.fixture
def repository() -> InMemoryActivityRepository:
    return InMemoryActivityRepository()


@pytest.fixture
def log(repository) -> ActivityLog:
    return ActivityLog(repository, clock=lambda: NOW, make_id=lambda: "e1")


async def test_record_stamps_the_entry(log, repository):
    entry = await log.record("u", AgentName.CALM_SENSE, "Did a thing", "Because.")

    assert entry == ActivityEntry("e1", NOW, AgentName.CALM_SENSE, "Did a thing", "Because.", SafetyStatus.PASSED)
    assert repository.entries["u"] == [entry]


@pytest.mark.parametrize(("asked", "used"), [(0, 1), (10, 10), (10_000, MAX_LIMIT)])
async def test_recent_clamps_the_limit(log, repository, asked, used):
    seen = []

    async def recent(user_id, limit):
        seen.append(limit)
        return []

    repository.recent = recent
    await log.recent("u", asked)

    assert seen == [used]


async def test_note_swallows_a_store_that_is_down(log, repository):
    async def down(user_id, entry):
        raise PersistenceError("down")

    repository.add = down

    await log.note("u", AgentName.CALM_SENSE, "x", "y")


async def test_record_lets_a_store_outage_through(log, repository):
    async def down(user_id, entry):
        raise PersistenceError("down")

    repository.add = down

    with pytest.raises(PersistenceError):
        await log.record("u", AgentName.CALM_SENSE, "x", "y")


@pytest.mark.parametrize(("activity", "user_id"), [(None, "u"), ("log", "")], ids=["no-log", "no-user"])
async def test_note_needs_a_log_and_a_user(log, repository, activity, user_id):
    await note(log if activity else None, user_id, AgentName.CALM_SENSE, "x", "y")

    assert repository.entries == {}


async def test_watch_logs_a_held_back_input_and_reraises(log, repository):
    with pytest.raises(UnsafeContentError):
        async with watch(log, "u", AgentName.SIMPLIFY_CORE):
            raise UnsafeContentError()

    [entry] = repository.entries["u"]
    assert (entry.agent, entry.safety_status) == (AgentName.SIMPLIFY_CORE, SafetyStatus.FLAGGED)


async def test_watch_ignores_other_errors(log, repository):
    with pytest.raises(RuntimeError):
        async with watch(log, "u", AgentName.SIMPLIFY_CORE):
            raise RuntimeError()

    assert repository.entries == {}


@pytest.mark.parametrize(
    ("text", "quoted"),
    [("short", '"short"'), ("  spaced \n out  ", '"spaced out"'), ("x" * 60, '"' + "x" * 49 + '…"')],
)
def test_quote(text, quoted):
    assert quote(text) == quoted
