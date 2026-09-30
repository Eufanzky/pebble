import pytest

from app.domain.tasks import Task, TaskStep


def task(*done: bool, completed: bool = False) -> Task:
    steps = tuple(TaskStep(f"s{i}", f"step {i}", completed=d) for i, d in enumerate(done))
    return Task("t", "Write the essay", completed=completed, steps=steps)


def test_ticking_a_step_changes_only_that_step():
    ticked = task(False, False).with_step_completed("s1", True)

    assert [s.completed for s in ticked.steps] == [False, True]
    assert not ticked.completed


def test_finishing_the_last_open_step_finishes_the_task():
    assert task(True, False).with_step_completed("s1", True).completed


def test_unticking_a_step_never_reopens_a_finished_task():
    """Progress only adds up (principle 1): taking a tick back doesn't take the finished task away."""
    unticked = task(True, True, completed=True).with_step_completed("s0", False)

    assert unticked.completed
    assert [s.completed for s in unticked.steps] == [False, True]


def test_an_unknown_step_is_a_key_error():
    with pytest.raises(KeyError):
        task(False).with_step_completed("nope", True)


def test_new_steps_keep_the_task_done_or_open():
    new = (TaskStep("n", "new step"),)

    assert task(True, completed=True).with_steps(new) == Task("t", "Write the essay", completed=True, steps=new)
    assert not task(completed=False).with_steps(new).completed
