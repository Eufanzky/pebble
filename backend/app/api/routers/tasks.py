from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.auth import get_current_user
from app.api.dependencies import get_break_down_task, get_export_plan, get_tasks, limit_agent_calls
from app.api.presenters import task_data
from app.api.schemas.tasks import (
    BreakdownRequest,
    StepsReplace,
    StepUpdate,
    TaskCreate,
    TaskOut,
    TasksOrder,
    TaskUpdate,
)
from app.application.breakdown import BreakDownTask
from app.application.calendar import ExportPlan
from app.application.tasks import Tasks
from app.domain.tasks import Step, Task, TaskStep

router = APIRouter()


def task_from(body: TaskCreate) -> Task:
    """A new task from the request; the use case picks the ids."""
    return Task(
        id="",
        title=body.title,
        time_estimate=body.time_estimate,
        tag=body.tag,
        priority=body.priority,
        completed=body.completed,
        why=body.why_explanation,
        due=body.due,
        steps=tuple(TaskStep("", s.title, s.time_estimate, s.completed) for s in body.steps),
    )

# API field names to domain field names, for partial updates.
FIELDS = {
    "title": "title",
    "time_estimate": "time_estimate",
    "tag": "tag",
    "priority": "priority",
    "completed": "completed",
    "why_explanation": "why",
    "due": "due",
}

# Fields where null means "none" rather than "not sent".
CLEARABLE = {"due"}


@router.get("", response_model=list[TaskOut], summary="List your tasks")
async def list_tasks(user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)):
    """Your tasks in the order you added them, each with its steps."""
    return [task_data(task) for task in await tasks.list(user_id)]


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED, summary="Add a task")
async def add_task(
    body: TaskCreate, user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)
):
    """Add a task to the end of your list. Pebble picks the ids of the task and its steps."""
    return task_data(await tasks.add(user_id, task_from(body)))


@router.put("/order", response_model=list[TaskOut], summary="Reorder your list")
async def reorder_tasks(
    body: TasksOrder, user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)
):
    """Put your tasks in this order. List every task exactly once; if the list changed meanwhile (or an id
    isn't yours), nothing moves and the answer is 409."""
    return [task_data(task) for task in await tasks.reorder(user_id, body.task_ids)]


@router.patch("/{task_id}", response_model=TaskOut, summary="Change a task")
async def update_task(
    task_id: str,
    body: TaskUpdate,
    user_id: str = Depends(get_current_user),
    tasks: Tasks = Depends(get_tasks),
):
    """Change only the fields you send, for example `{"completed": true}`. `{"due": null}` removes the due day."""
    changes = {
        FIELDS[name]: value
        for name, value in body.model_dump(exclude_unset=True).items()
        if value is not None or name in CLEARABLE
    }
    return task_data(await tasks.update(user_id, task_id, changes))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove a task")
async def delete_task(task_id: str, user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)):
    await tasks.delete(user_id, task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT, summary="Clear your list")
async def clear_tasks(user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)):
    """Remove every task on your list."""
    await tasks.clear(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{task_id}/breakdown",
    response_model=TaskOut,
    summary="Break a task down with CalmSense",
    dependencies=[Depends(limit_agent_calls)],
)
async def break_down(
    task_id: str,
    body: BreakdownRequest,
    user_id: str = Depends(get_current_user),
    break_down_task: BreakDownTask = Depends(get_break_down_task),
):
    """CalmSense splits the task into steps of your step size and says why; they replace its steps.

    The title is safety-checked first (422 if it's held back). If CalmSense can't answer, it's a 503 and the
    task stays as it was. The result goes in your activity log.
    """
    return task_data(await break_down_task(user_id, task_id, body.time_of_day))


@router.delete("/{task_id}/breakdown", response_model=TaskOut, summary="Remove a task's breakdown")
async def remove_breakdown(task_id: str, user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)):
    """Undo or dismiss a CalmSense breakdown: the task keeps its title, tag and the rest, without steps or "why".

    Progress already made isn't taken back (counts only add up).
    """
    return task_data(await tasks.remove_breakdown(user_id, task_id))


@router.post("/{task_id}/let-go", response_model=TaskOut, summary="Let a task go")
async def let_go(task_id: str, user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)):
    """Take an open task off your list (8.4). It's kept, with when, in your data, and nothing counts it against
    you: letting go is a fine outcome. A finished task is a 409."""
    return task_data(await tasks.let_go(user_id, task_id))


@router.delete("/{task_id}/let-go", response_model=TaskOut, summary="Take a task back")
async def take_back(task_id: str, user_id: str = Depends(get_current_user), tasks: Tasks = Depends(get_tasks)):
    """Undo letting a task go: it's back on your list where it was."""
    return task_data(await tasks.take_back(user_id, task_id))


@router.get(
    "/{task_id}/calendar.ics",
    summary="The task's plan as a calendar file",
    response_class=Response,
    responses={200: {"content": {"text/calendar": {}}, "description": "An iCalendar file (RFC 5545)"}},
)
async def calendar_file(
    task_id: str,
    start: datetime | None = Query(default=None, description="When the first step starts, with its UTC offset"),
    user_id: str = Depends(get_current_user),
    export_plan: ExportPlan = Depends(get_export_plan),
):
    """BridgeBot: the open steps one after another from `start` (now if left out), each as long as its estimate.
    Import the file into Google Calendar, Outlook or any calendar app. A task without open steps is one event.
    """
    if start is not None and start.tzinfo is None:
        raise HTTPException(status_code=422, detail="Give the start time with its UTC offset.")
    ics = await export_plan(user_id, task_id, start or datetime.now(UTC))
    return Response(content=ics, media_type="text/calendar; charset=utf-8")


@router.put("/{task_id}/steps", response_model=TaskOut, summary="Replace a task's steps")
async def replace_steps(
    task_id: str,
    body: StepsReplace,
    user_id: str = Depends(get_current_user),
    tasks: Tasks = Depends(get_tasks),
):
    """Set a task's steps, for example from a CalmSense breakdown. The new steps start open."""
    steps = [Step(s.title, s.time_estimate) for s in body.steps]
    return task_data(await tasks.set_steps(user_id, task_id, steps))


@router.patch("/{task_id}/steps/{step_id}", response_model=TaskOut, summary="Tick a step on or off")
async def update_step(
    task_id: str,
    step_id: str,
    body: StepUpdate,
    user_id: str = Depends(get_current_user),
    tasks: Tasks = Depends(get_tasks),
):
    """Finishing the last open step also finishes the task. Unticking a step never reopens it."""
    return task_data(await tasks.set_step_completed(user_id, task_id, step_id, body.completed))
