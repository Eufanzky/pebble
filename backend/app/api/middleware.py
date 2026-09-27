"""Request logging: one structured line per request, with timing."""

import logging
import time
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("pebble.requests")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        if request.url.path != "/api/health":
            duration_ms = round((time.perf_counter() - start) * 1000)
            logger.info(
                "%s %s -> %s (%sms)",
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
                extra={"method": request.method, "path": request.url.path, "status": response.status_code,
                       "duration_ms": duration_ms},
            )
        return response
