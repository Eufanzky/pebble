"""Breaking down a task on the user's list with CalmSense, and keeping what it suggests."""

from dataclasses import dataclass

from app.application.agents.calmsense import DecomposeTask
from app.application.preferences import UserPreferences
from app.application.tasks import Tasks
from app.domain.tasks import Task


@dataclass
class BreakDownTask:
    tasks: Tasks
    calmsense: DecomposeTask
    preferences: UserPreferences

    async def __call__(self, user_id: str, task_id: str, time_of_day: str = "day") -> Task:
        """Ask CalmSense to break the task into steps of the user's step size, then save them and its "why".

        CalmSense screens the title and logs the result itself. Nothing is saved unless it answers.
        """
        task = await self.tasks.get(user_id, task_id)
        preferences = await self.preferences.get(user_id)
        breakdown = await self.calmsense(task.title, str(preferences.step_size), time_of_day, user_id=user_id)
        return await self.tasks.set_breakdown(user_id, task_id, breakdown.steps, breakdown.why)
