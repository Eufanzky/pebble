import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings

logger = logging.getLogger("focusbuddy")

_telemetry_initialized = False
_meter = None
_agent_latency_histogram = None
_agent_call_counter = None
_safety_flag_counter = None
_task_op_counter = None
_groundedness_counter = None
_prompt_shield_counter = None


def init_telemetry() -> None:
    """Initialize Azure Monitor / Application Insights telemetry with custom metrics."""
    global _telemetry_initialized, _meter
    global _agent_latency_histogram, _agent_call_counter, _safety_flag_counter
    global _task_op_counter, _groundedness_counter, _prompt_shield_counter
    if _telemetry_initialized:
        return

    conn_string = settings.applicationinsights_connection_string
    if not conn_string:
        logger.info("App Insights not configured, skipping telemetry init")
        _telemetry_initialized = True
        return

    try:
        from azure.monitor.opentelemetry import configure_azure_monitor
        from opentelemetry import metrics

        configure_azure_monitor(
            connection_string=conn_string,
            enable_live_metrics=True,
        )

        _meter = metrics.get_meter("focusbuddy", "1.0.0")

        _agent_latency_histogram = _meter.create_histogram(
            name="focusbuddy.agent.latency_ms",
            description="Agent response latency in milliseconds",
            unit="ms",
        )
        _agent_call_counter = _meter.create_counter(
            name="focusbuddy.agent.calls",
            description="Total agent invocations",
        )
        _safety_flag_counter = _meter.create_counter(
            name="focusbuddy.safety.flags",
            description="Content Safety flag events",
        )
        _task_op_counter = _meter.create_counter(
            name="focusbuddy.tasks.operations",
            description="Task CRUD operations",
        )
        _groundedness_counter = _meter.create_counter(
            name="focusbuddy.groundedness.checks",
            description="Groundedness detection results",
        )
        _prompt_shield_counter = _meter.create_counter(
            name="focusbuddy.prompt_shield.checks",
            description="Prompt Shield detection results",
        )

        logger.info("Azure Monitor telemetry initialized with custom metrics")
    except Exception as e:
        logger.warning(f"Failed to init Azure Monitor: {e}")

    _telemetry_initialized = True


def record_agent_latency(agent_name: str, duration_ms: float) -> None:
    """Record agent response latency to App Insights."""
    if _agent_latency_histogram:
        _agent_latency_histogram.record(duration_ms, {"agent": agent_name})


def record_agent_call(agent_name: str, success: bool = True) -> None:
    """Record an agent invocation."""
    if _agent_call_counter:
        _agent_call_counter.add(1, {"agent": agent_name, "success": str(success)})


def record_safety_flag(category: str, severity: int) -> None:
    """Record a Content Safety flag event."""
    if _safety_flag_counter:
        _safety_flag_counter.add(1, {"category": category, "severity": str(severity)})


def record_task_operation(operation: str) -> None:
    """Record a task CRUD operation (create, complete, delete)."""
    if _task_op_counter:
        _task_op_counter.add(1, {"operation": operation})


def record_groundedness_check(grounded: bool) -> None:
    """Record a groundedness detection result."""
    if _groundedness_counter:
        _groundedness_counter.add(1, {"grounded": str(grounded)})


def record_prompt_shield_check(attack_detected: bool) -> None:
    """Record a Prompt Shield detection result."""
    if _prompt_shield_counter:
        _prompt_shield_counter.add(1, {"attack_detected": str(attack_detected)})


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
