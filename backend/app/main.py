"""Composition root: builds the FastAPI app, its middleware and routers, and closes adapters on shutdown."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import dependencies
from app.api.errors import register_error_handlers
from app.api.middleware import RequestLoggingMiddleware
from app.api.routers import account, activity, agents, documents, importing, preferences, stats, suggestions, tasks
from app.infrastructure.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")

DESCRIPTION = """
Backend for **Pebble**, a calm assistant for neurodivergent users.

- **Agents:** the orchestrator routes each chat message to CalmSense (task breakdown), SimplifyCore
  (simpler text at your reading level) or PebbleVoice (specific encouragement).
- **Safety:** every input goes through Prompt Shields, Content Safety and PII redaction before any model
  sees it; every reply is checked again. Content Safety is optional; redaction always runs.
- **Tasks, preferences and activity:** saved per user in Postgres. Every agent result, and every message
  held back by the safety checks, is written to the activity log with the agent's reasoning.
- **Documents:** PDF, Word and text files are parsed in memory and never stored.
- **LLM:** Groq's free tier by default, any OpenAI-compatible provider by config, or a scripted fake
  with `LLM_PROVIDER=fake`.

Voice rules for every reply: never shame, rush or compare; be specific; short, plain sentences.
"""

TAGS_METADATA = [
    {"name": "AI Agents", "description": "Chat with Pebble, or call CalmSense, SimplifyCore and PebbleVoice directly."},
    {"name": "Documents", "description": "Read a document's text in memory, and the optional Immersive Reader token."},
    {"name": "Tasks", "description": "Your task list and the steps each task is broken into, saved in Postgres."},
    {"name": "Preferences", "description": "How you like Pebble to look, speak and pace things."},
    {"name": "Activity", "description": "What each agent did for you, and why. The agents log their own results."},
    {"name": "Import", "description": "Move what a browser kept before sign-in into your account, once."},
    {"name": "Account", "description": "Download everything Pebble stores about you, or delete it all."},
    {"name": "Stats", "description": "What you finished, by day and tag. Counts only ever add up."},
    {"name": "Health", "description": "Server health check."},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await dependencies.get_container().aclose()
    dependencies.set_container(None)


app = FastAPI(
    title="Pebble API",
    version="0.2.0",
    summary="A calm assistant for neurodivergent users",
    description=DESCRIPTION,
    lifespan=lifespan,
    openapi_tags=TAGS_METADATA,
    license_info={"name": "MIT"},
    swagger_ui_parameters={"docExpansion": "list", "defaultModelsExpandDepth": 1, "filter": True},
)

register_error_handlers(app)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])
app.include_router(importing.router, prefix="/api/import", tags=["Import"])
app.include_router(account.router, prefix="/api/account", tags=["Account"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(suggestions.router, prefix="/api/suggestions", tags=["AdaptLens"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Check if the server is running."""
    return {"status": "ok"}
