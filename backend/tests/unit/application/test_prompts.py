"""Every agent's prompt carries Pebble's voice rules, and the rules carry principle 1 (8.1)."""

import pytest

from app.application.prompts import (
    CALMSENSE_PROMPT,
    ORCHESTRATOR_PROMPT,
    PEBBLE_VOICE_RULES,
    PEBBLEVOICE_PROMPT,
    SIMPLIFYCORE_PROMPT,
    WHYBOT_PROMPT,
)


@pytest.mark.parametrize(
    "prompt", [ORCHESTRATOR_PROMPT, CALMSENSE_PROMPT, SIMPLIFYCORE_PROMPT, PEBBLEVOICE_PROMPT, WHYBOT_PROMPT]
)
def test_every_agent_follows_the_voice_rules(prompt):
    assert PEBBLE_VOICE_RULES in prompt


@pytest.mark.parametrize(
    "rule",
    [
        "streaks",
        "missed days",
        "how long the user was away",
        '"still open", never "overdue"',
        "letting a task go is a fine outcome",
        "loss framing",
        "under 20 words",
    ],
)
def test_the_voice_rules_ban_guilt(rule):
    assert rule in PEBBLE_VOICE_RULES
