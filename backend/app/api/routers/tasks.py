from fastapi import APIRouter, Depends, Response, status

from app.api.auth import get_current_user
from app.api.dependencies import get_tasks
from app.api.presenters import task_data
from app.api.schemas.tasks import StepsReplace, StepUpdate, TaskCreate, TaskOut, TasksOrder, TaskUpdate
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
}


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
    """Change only the fields you send, for example `{"completed": true}`."""
    changes = {FIELDS[name]: value for name, value in body.model_dump(exclude_unset=True).items() if value is not None}
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
