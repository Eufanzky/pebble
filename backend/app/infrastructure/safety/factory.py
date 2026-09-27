"""Builds the ``SafetyChecker``: Azure Content Safety when configured, otherwise the no-op one."""

import logging

from app.application.ports.safety import SafetyChecker
from app.infrastructure.config import Settings
from app.infrastructure.safety.azure_content_safety import AzureContentSafety
from app.infrastructure.safety.noop import NoOpSafetyChecker

logger = logging.getLogger("pebble.safety")


def build_safety_checker(settings: Settings) -> SafetyChecker:
    if settings.content_safety_endpoint and settings.content_safety_key:
        return AzureContentSafety(endpoint=settings.content_safety_endpoint, key=settings.content_safety_key)
    logger.info("Content Safety not configured: content checks are off (PII redaction still runs)")
    return NoOpSafetyChecker()
