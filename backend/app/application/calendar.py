"""BridgeBot: a task's plan as a calendar file to import anywhere (7.7)."""

from dataclasses import dataclass
from datetime import datetime

from app.application.activity import ActivityLog, note, quote
from app.application.ports.calendar import CalendarWriter
from app.application.tasks import Tasks
from app.domain.agents import AgentName
from app.domain.calendar import plan


@dataclass
class ExportPlan:
    tasks: Tasks
    writer: CalendarWriter
    activity: ActivityLog | None = None

    async def __call__(self, user_id: str, task_id: str, start: datetime) -> bytes:
        """The task's open steps, back to back from ``start``, as an ``.ics`` file. Logged as BridgeBot."""
        task = await self.tasks.get(user_id, task_id)
        events = plan(task, start)
        count = len(events)
        await note(
            self.activity,
            user_id,
            AgentName.BRIDGE_BOT,
            f"Put {quote(task.title)} in a calendar file ({count} event{'' if count == 1 else 's'})",
            f"The open steps one after another from {start:%H:%M}, each as long as its estimate.",
        )
        return self.writer.write(events)
