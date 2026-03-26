import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.config import settings
from app.routers import tasks, preferences, activity, agents, documents, focus, audit, verify
from app.services.db import init_db, close_db
from app.services.monitoring import RequestLoggingMiddleware, init_telemetry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

TAGS_METADATA = [
    {
        "name": "Tasks",
        "description": "CRUD operations for user tasks. Tasks are time-boxed, tagged, and support subtasks. "
        "Stored in Azure Cosmos DB, partitioned by userId.",
    },
    {
        "name": "Preferences",
        "description": "User accessibility preferences: reading level, chunk size, reduce animations, calm mode, "
        "Pebble color/personality/model. Auto-creates defaults on first access.",
    },
    {
        "name": "Activity",
        "description": "Append-only activity log. Every meaningful action is logged with an agent name, reasoning, "
        "and safety status for full explainability.",
    },
    {
        "name": "AI Agents",
        "description": "GPT-4o-powered agents behind the Pebble companion. All input and output passes through "
        "Azure Content Safety. Agents follow Pebble voice rules: no shame, no pressure, specific not generic.\n\n"
        "**Agents:**\n"
        "- **CalmSense** — Task decomposition into time-boxed subtasks\n"
        "- **SimplifyCore** — Document simplification at adjustable reading levels\n"
        "- **PebbleVoice** — Personalized motivation and orchestration\n"
        "- **Pebble Orchestrator** — Intent classification + routing to sub-agents",
    },
    {
        "name": "Documents",
        "description": "Full document processing pipeline:\n\n"
        "1. **Upload** → Azure Blob Storage\n"
        "2. **Parse** → Azure Document Intelligence (PDF/Word/text)\n"
        "3. **Simplify** → GPT-4o at target reading level\n"
        "4. **Index** → Azure AI Search for RAG queries\n"
        "5. **Extract tasks** → Convert action items into real tasks",
    },
    {
        "name": "Focus Room",
        "description": "Virtual co-working rooms with real-time presence via Azure Web PubSub. "
        "No cameras, no microphones — just shared focus. Includes Pomodoro timer sync and "
        "motivational check-in from Pebble on session completion.",
    },
    {
        "name": "Audit Trail",
        "description": "Observability and explainability endpoints. Powers the Activity Feed in the frontend. "
        "Every agent decision is logged with reasoning so users can ask \"Why did Pebble do this?\"",
    },
    {
        "name": "Health",
        "description": "Server health check.",
    },
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_telemetry()
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Focusbuddy API",
    version="0.1.0",
    lifespan=lifespan,
    openapi_tags=TAGS_METADATA,
    swagger_ui_parameters={
        "docExpansion": "list",
        "defaultModelsExpandDepth": 1,
        "filter": True,
        "tryItOutEnabled": True,
    },
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Focusbuddy API",
        version="0.1.0",
        summary="AI-powered cognitive load reduction assistant for neurodivergent users",
        description=(
            "Backend API for **Focusbuddy**, a calm productivity companion powered by Pebble the cat.\n\n"
            "## Architecture\n\n"
            "Built on **Microsoft Foundry** (formerly Azure AI Foundry) and Azure services:\n\n"
            "- **Microsoft Foundry Agent Service** — multi-agent orchestration\n"
            "- **4 AI agents** orchestrated by Pebble via Azure OpenAI GPT-4o\n"
            "- **Azure AI Content Safety** filtering on all agent input/output\n"
            "- **Azure Cosmos DB** for tasks, preferences, activity, documents, rooms\n"
            "- **Azure Blob Storage + AI Document Intelligence + AI Search** for the document pipeline\n"
            "- **Azure Web PubSub** for real-time focus room presence\n"
            "- **Azure Application Insights** for observability and audit trail\n"
            "- **Microsoft Entra ID** JWT authentication on all endpoints\n\n"
            "## Authentication\n\n"
            "All endpoints (except `/api/health`) require a Bearer token:\n\n"
            "```\nAuthorization: Bearer <entra-id-jwt>\n```\n\n"
            "## Responsible AI\n\n"
            "Every agent response follows Pebble's voice rules:\n"
            "- Never shame, rush, or pressure the user\n"
            "- Be specific, not generic (\"you finished 3 things\" not \"great job!\")\n"
            "- Every AI decision is logged with reasoning for full explainability"
        ),
        routes=app.routes,
        tags=TAGS_METADATA,
    )
    openapi_schema["info"]["contact"] = {
        "name": "Focusbuddy",
    }
    openapi_schema["info"]["license"] = {
        "name": "MIT",
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(focus.router, prefix="/api/focus", tags=["Focus Room"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Trail"])
app.include_router(verify.router, prefix="/api/verify", tags=["Service Verification"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Check if the server is running."""
    return {"status": "ok"}
