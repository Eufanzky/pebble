"""Deterministic checks for Pebble's voice rules (``PEBBLE_VOICE_RULES`` in ``application/prompts.py``).

Used by the evals on real replies; unit-tested in ``tests/unit/test_voice_rules.py``.
"""

import re

# Shaming, rushing, minimising, comparing, and guilt (mission principles 1 and 4).
BANNED = (
    r"you should have",
    r"you(?:'|’)?re behind",
    r"this is easy",
    r"just do it",
    r"\bhurry\b",
    r"\basap\b",
    r"\blazy\b",
    r"no excuses",
    r"\boverdue\b",
    r"\bstreak",
    r"everyone else",
    r"other people (?:manage|can|do)",
    r"\bfail(?:ed|ure)\b",
)
MAX_SENTENCE_WORDS = 30
MAX_MEAN_SENTENCE_WORDS = 20


def sentences(text: str) -> list[str]:
    return [s for s in re.split(r"(?<=[.!?])\s+|\n+", text.strip()) if s.strip()]


def voice_problems(text: str) -> list[str]:
    """Every voice-rule problem in ``text``; empty when it follows the rules."""
    problems = [f"banned phrase: {p}" for p in BANNED if re.search(p, text, re.IGNORECASE)]
    lengths = [len(s.split()) for s in sentences(text)]
    if lengths and max(lengths) > MAX_SENTENCE_WORDS:
        problems.append(f"a sentence has {max(lengths)} words (max {MAX_SENTENCE_WORDS})")
    if lengths and sum(lengths) / len(lengths) > MAX_MEAN_SENTENCE_WORDS:
        problems.append(f"sentences average {sum(lengths) / len(lengths):.0f} words (max {MAX_MEAN_SENTENCE_WORDS})")
    return problems
