"""The app as a whole: it starts with only an LLM key, and exposes only what works."""

from asgi_lifespan import LifespanManager

from app.api import dependencies
from app.api.dependencies import Container
from app.infrastructure.config import Settings
from app.infrastructure.db.activity import SqlActivityRepository, UnconfiguredActivityRepository
from app.infrastructure.db.preferences import SqlPreferencesRepository
from app.infrastructure.db.tasks import SqlTaskRepository, UnconfiguredTaskRepository
from app.infrastructure.llm.openai_compatible import OpenAICompatibleLLM
from app.infrastructure.safety.noop import NoOpSafetyChecker


async def test_starts_and_stops_with_only_an_llm_key(app, client):
    dependencies.set_container(Container.from_settings(Settings(_env_file=None, llm_api_key="gh-token")))
    container = dependencies.get_container()

    async with LifespanManager(app):
        resp = await client.get("/api/health")

    assert resp.json() == {"status": "ok"}
    assert isinstance(container.llm, OpenAICompatibleLLM)
    assert isinstance(container.safety_checker, NoOpSafetyChecker)
    assert isinstance(container.task_repository, UnconfiguredTaskRepository)
    assert isinstance(container.activity_repository, UnconfiguredActivityRepository)


async def test_a_database_url_saves_everything_in_postgres(app):
    """The engine is built lazily (no connection until a query) and disposed on shutdown."""
    url = "postgresql+asyncpg://pebble:pebble@localhost:5432/pebble"
    container = Container.from_settings(Settings(_env_file=None, llm_api_key="key", database_url=url))
    dependencies.set_container(container)

    async with LifespanManager(app):
        pass

    assert isinstance(container.task_repository, SqlTaskRepository)
    assert isinstance(container.preferences_repository, SqlPreferencesRepository)
    assert isinstance(container.activity_repository, SqlActivityRepository)
    assert container.engine is not None


async def test_only_working_routes_are_exposed(client):
    paths = set((await client.get("/openapi.json")).json()["paths"])

    assert paths == {
        "/api/health",
        "/api/agents/chat",
        "/api/agents/decompose",
        "/api/agents/simplify",
        "/api/agents/motivate",
        "/api/documents/parse",
        "/api/documents/immersive-reader/token",
        "/api/tasks",
        "/api/preferences",
        "/api/activity",
        "/api/import",
        "/api/account/export",
        "/api/account",
        "/api/stats",
        "/api/stats/focus",
        "/api/tasks/{task_id}",
        "/api/tasks/order",
        "/api/tasks/{task_id}/breakdown",
        "/api/tasks/{task_id}/steps",
        "/api/tasks/{task_id}/steps/{step_id}",
    }


async def test_openapi_schema_builds(client):
    resp = await client.get("/openapi.json")

    assert resp.status_code == 200
    assert resp.json()["info"]["title"] == "Pebble API"
