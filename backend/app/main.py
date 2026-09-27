"""Composition root: builds the FastAPI app, its middleware and routers, and closes adapters on shutdown."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import dependencies
from app.api.errors import register_error_handlers
from app.api.middleware import RequestLoggingMiddleware
from app.api.routers import agents, documents
from app.infrastructure.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")

DESCRIPTION = """
Backend for **Pebble**, a calm assistant for neurodivergent users.

- **Agents:** the orchestrator routes each chat message to CalmSense (task breakdown), SimplifyCore
  (simpler text at your reading level) or PebbleVoice (specific encouragement).
- **Safety:** every input goes through Prompt Shields, Content Safety and PII redaction before any model
  sees it; every reply is checked again. Content Safety is optional; redaction always runs.
- **Documents:** PDF, Word and text files are parsed in memory and never stored.
- **LLM:** any OpenAI-compatible provider (GitHub Models by default), or a scripted fake with `LLM_PROVIDER=fake`.

Voice rules for every reply: never shame, rush or compare; be specific; short, plain sentences.
"""

TAGS_METADATA = [
    {"name": "AI Agents", "description": "Chat with Pebble, or call CalmSense, SimplifyCore and PebbleVoice directly."},
    {"name": "Documents", "description": "Read a document's text in memory, and the optional Immersive Reader token."},
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
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Check if the server is running."""
    return {"status": "ok"}
