"""Characterization tests for the regex PII detector (roadmap 1.3)."""

import pytest

from app.services.pii_detector import detect_pii, redact_pii


@pytest.mark.parametrize(
    ("text", "category", "redacted"),
    [
        ("Write to sam.lee+uni@example.co.uk today", "email", "Write to [REDACTED] today"),
        ("Call 555-123-4567", "phone", "Call [REDACTED]"),
        ("Call (555) 123-4567", "phone", "Call [REDACTED]"),
        ("Call +1 555.123.4567", "phone", "Call [REDACTED]"),
        ("SSN 123-45-6789", "ssn", "SSN [REDACTED]"),
        ("Card 4111 1111 1111 1111", "credit_card", "Card [REDACTED]"),
    ],
)
def test_detects_and_redacts_each_category(text, category, redacted):
    result = detect_pii(text)

    assert result.has_pii
    assert category in result.categories
    assert result.redacted_text == redacted


def test_text_without_pii_is_unchanged():
    result = detect_pii("Finish the essay by 5pm, chapter 12")

    assert not result.has_pii
    assert result.categories == []
    assert result.redacted_text == "Finish the essay by 5pm, chapter 12"


def test_redacts_every_match_and_lists_each_category_once():
    result = detect_pii("a@b.io, c@d.io and 555-123-4567")

    assert result.categories == ["email", "phone"]
    assert result.redacted_text == "[REDACTED], [REDACTED] and [REDACTED]"


def test_redact_pii_returns_only_the_text():
    assert redact_pii("Mail me: sam@example.com") == "Mail me: [REDACTED]"
