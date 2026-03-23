import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings

logger = logging.getLogger("focusbuddy")

_telemetry_initialized = False


def init_telemetry() -> None:
    """Initialize Azure Monitor / Application Insights telemetry."""
    global _telemetry_initialized
    if _telemetry_initialized:
        return

    conn_string = settings.applicationinsights_connection_string
    if not conn_string:
        logger.info("App Insights not configured, skipping telemetry init")
        _telemetry_initialized = True
        return

    try:
        from azure.monitor.opentelemetry import configure_azure_monitor

        configure_azure_monitor(
            connection_string=conn_string,
            enable_live_metrics=True,
        )
        logger.info("Azure Monitor telemetry initialized")
    except Exception as e:
        logger.warning(f"Failed to init Azure Monitor: {e}")

    _telemetry_initialized = True


def log_agent_decision(
    agent_name: str,
    action: str,
    reasoning: str,
    user_id: str,
    safety_status: str = "passed",
    extra: dict | None = None,
) -> None:
    """
    Log an agent decision for the audit trail.
    Sent to both Python logging (stdout) and App Insights (if configured).
    """
    log_data = {
        "agent": agent_name,
        "action": action,
        "reasoning": reasoning,
        "userId": user_id,
        "safetyStatus": safety_status,
    }
    if extra:
        log_data.update(extra)

    logger.info(
        f"[AGENT] {agent_name}: {action}",
        extra={"custom_dimensions": log_data},
    )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all API requests with timing for observability."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        # Skip health checks from logs
        if request.url.path == "/api/health":
            return response

        logger.info(
            f"{request.method} {request.url.path} → {response.status_code} ({duration_ms:.0f}ms)",
            extra={
                "custom_dimensions": {
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration_ms),
                }
            },
        )

        return response
