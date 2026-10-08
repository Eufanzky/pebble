"""The voice-rule checker the LLM evals use, checked without an LLM."""

import pytest

from tests.evals.voice import sentences, voice_problems


@pytest.mark.parametrize(
    "text",
    [
        "You finished 3 things today. That counts.",
        "No rush. We can take this one small step at a time.",
        "That sounds really hard. It's okay to step back.",
        "This one is still open. Move it, make it smaller, or let it go?",
    ],
)
def test_calm_specific_replies_pass(text):
    assert voice_problems(text) == []


@pytest.mark.parametrize(
    "text",
    [
        "You should have started earlier.",
        "You’re behind on your reading.",
        "Come on, this is easy!",
        "Just do it.",
        "Hurry up and finish.",
        "Don't be lazy.",
        "Your streak is at 5 days!",
        "Everyone else finished already.",
        "Two tasks are overdue.",
        "Five days in a row!",
        "You missed yesterday.",
        "You've been away for a while.",
        "Since you last opened Pebble, a lot changed.",
        "Don't lose your progress.",
        "You're falling behind.",
        "Last chance to finish this today.",
    ],
)
def test_banned_phrases_are_caught(text):
    assert any(p.startswith("banned phrase") for p in voice_problems(text))


def test_long_sentences_are_caught():
    long = " ".join(["word"] * 31) + "."

    assert voice_problems(long) == ["a sentence has 31 words (max 30)", "sentences average 31 words (max 20)"]


def test_sentences_split_on_punctuation_and_lines():
    assert sentences("One. Two!\nThree? Four") == ["One.", "Two!", "Three?", "Four"]
