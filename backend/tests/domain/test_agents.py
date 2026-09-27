import pytest

from app.domain.agents import Intent, Mood
from app.domain.tasks import Step, TaskBreakdown, TaskTag


@pytest.mark.parametrize(
    ("value", "intent"), [("decompose", Intent.DECOMPOSE), ("banana", Intent.CHAT), (None, Intent.CHAT)]
)
def test_unknown_intent_is_chat(value, intent):
    assert Intent.parse(value) is intent


@pytest.mark.parametrize(("value", "mood"), [("sleepy", Mood.SLEEPY), ("furious", Mood.NORMAL), (None, Mood.NORMAL)])
def test_unknown_mood_is_normal(value, mood):
    assert Mood.parse(value) is mood


def test_breakdown_texts_and_mapping():
    breakdown = TaskBreakdown((Step("a", "~5 min"), Step("b")), why="c")

    assert breakdown.texts() == ["a", "b", "c"]
    assert breakdown.map_text(str.upper) == TaskBreakdown((Step("A", "~5 min"), Step("B")), why="C")


def test_unknown_task_tag_is_project():
    assert TaskTag.parse("study") is TaskTag.STUDY
    assert TaskTag.parse("homework") is TaskTag.PROJECT
