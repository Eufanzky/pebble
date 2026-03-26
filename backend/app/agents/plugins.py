import json

from semantic_kernel.functions import kernel_function

from app.agents.task_decomposition import decompose_task
from app.agents.document_simplification import simplify_document
from app.agents.motivation import generate_motivation


class TaskDecompositionPlugin:
    @kernel_function(name="decompose_task", description="Break a task into time-boxed subtasks")
    async def decompose(self, task_title: str, chunk_size: str = "medium", time_of_day: str = "day") -> str:
        result = await decompose_task(task_title, chunk_size, time_of_day)
        return json.dumps(result)


class DocumentSimplificationPlugin:
    @kernel_function(name="simplify_document", description="Simplify text to a target reading level")
    async def simplify(self, text: str, reading_level: int = 5) -> str:
        result = await simplify_document(text, reading_level)
        return json.dumps(result)


class MotivationPlugin:
    @kernel_function(name="generate_motivation", description="Generate personalized encouragement")
    async def motivate(self, tasks_completed: int = 0, tasks_total: int = 0, time_of_day: str = "day", personality: str = "gentle") -> str:
        result = await generate_motivation(tasks_completed, tasks_total, [], time_of_day, personality)
        return json.dumps(result)
