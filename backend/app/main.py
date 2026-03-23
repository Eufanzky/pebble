from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import tasks, preferences, activity, agents, documents
from app.services.db import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Focusbuddy API",
    description="Backend API for the Focusbuddy cognitive load reduction assistant",
    version="0.1.0",
    lifespan=lifespan,
)

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


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
