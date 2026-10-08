"""Maps use-case errors to HTTP responses. Details are safe to show; internals stay in the logs."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.application.adaptation import SuggestionGoneError
from app.application.documents import DocumentTooLargeError
from app.application.errors import AgentReplyError, PromptAttackError, UnsafeContentError, UnsafeOutputError
from app.application.ports.documents import DocumentError, UnsupportedDocumentError
from app.application.ports.llm import LLMError, LLMRateLimitedError
from app.application.ports.persistence import PersistenceError
from app.application.ports.safety import SafetyCheckError
from app.application.tasks import TaskFinishedError, TaskNotFoundError, TaskOrderError

logger = logging.getLogger("pebble.api")

UNAVAILABLE = "Pebble couldn't answer just now. Try again in a little while."
NOT_SAVED = "Pebble couldn't reach your saved tasks just now. Try again in a little while."
RESTING = "Pebble is resting for a moment. Try again in a little while."


def _detail(status: int, detail: str, headers: dict[str, str] | None = None) -> JSONResponse:
    return JSONResponse(status_code=status, content={"detail": detail}, headers=headers)


async def _rejected_input(_: Request, exc: Exception) -> JSONResponse:
    return _detail(422, str(exc))


async def _unsafe_output(_: Request, exc: Exception) -> JSONResponse:
    return _detail(422, str(UnsafeContentError()))


async def _rate_limited(_: Request, exc: LLMRateLimitedError) -> JSONResponse:
    headers = {"Retry-After": str(int(exc.retry_after))} if exc.retry_after else None
    return _detail(503, RESTING, headers)


async def _unavailable(_: Request, exc: Exception) -> JSONResponse:
    logger.warning("Agent unavailable: %s: %s", type(exc).__name__, exc)
    return _detail(503, UNAVAILABLE)


async def _document(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, DocumentTooLargeError):
        return _detail(413, str(exc))
    if isinstance(exc, UnsupportedDocumentError):
        return _detail(415, str(exc))
    return _detail(422, str(exc))


async def _not_found(_: Request, exc: Exception) -> JSONResponse:
    return _detail(404, str(exc))


async def _conflict(_: Request, exc: Exception) -> JSONResponse:
    return _detail(409, str(exc))


async def _persistence(_: Request, exc: Exception) -> JSONResponse:
    logger.warning("Database unavailable: %s", exc)
    return _detail(503, NOT_SAVED)


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(DocumentError, _document)
    app.add_exception_handler(PromptAttackError, _rejected_input)
    app.add_exception_handler(UnsafeContentError, _rejected_input)
    app.add_exception_handler(UnsafeOutputError, _unsafe_output)
    app.add_exception_handler(LLMRateLimitedError, _rate_limited)
    app.add_exception_handler(TaskNotFoundError, _not_found)
    app.add_exception_handler(TaskOrderError, _conflict)
    app.add_exception_handler(TaskFinishedError, _conflict)
    app.add_exception_handler(SuggestionGoneError, _conflict)
    app.add_exception_handler(PersistenceError, _persistence)
    for error in (LLMError, SafetyCheckError, AgentReplyError):
        app.add_exception_handler(error, _unavailable)
