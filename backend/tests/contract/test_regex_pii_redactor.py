"""The regex PII redactor (pinned in 1.3, moved behind the ``PIIRedactor`` port in 2.3)."""

import pytest

from app.infrastructure.pii.regex_redactor import RegexPIIRedactor

redact = RegexPIIRedactor().redact


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
    result = redact(text)

    assert result.found_pii
    assert category in result.categories
    assert result.text == redacted


def test_text_without_pii_is_unchanged():
    result = redact("Finish the essay by 5pm, chapter 12")

    assert not result.found_pii
    assert result.categories == []
    assert result.text == "Finish the essay by 5pm, chapter 12"


def test_redacts_every_match_and_lists_each_category_once():
    result = redact("a@b.io, c@d.io and 555-123-4567")

    assert result.categories == ["email", "phone"]
    assert result.text == "[REDACTED], [REDACTED] and [REDACTED]"
