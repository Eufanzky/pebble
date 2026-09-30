"""Domain results as the JSON the frontend reads (camelCase, the ``ChatResponse`` shape)."""

from app.domain.chat import ChatReply
from app.domain.documents import Simplification
from app.domain.tasks import Task, TaskBreakdown


def breakdown_data(breakdown: TaskBreakdown) -> dict:
    return {
        "subtasks": [{"title": s.title, "timeEstimate": s.time_estimate} for s in breakdown.steps],
        "whyExplanation": breakdown.why,
    }


def simplification_data(simplification: Simplification) -> dict:
    return {
        "simplified": simplification.simplified,
        "extractedTasks": [
            {"title": t.title, "timeEstimate": t.time_estimate, "tag": str(t.tag)}
            for t in simplification.extracted_tasks
        ],
        "tags": list(simplification.tags),
        "whyExplanation": simplification.why,
        "groundedness": {
            "grounded": simplification.groundedness.grounded,
            "ungroundedPercentage": simplification.groundedness.ungrounded_percentage,
        },
    }


def chat_response(reply: ChatReply) -> dict:
    if isinstance(reply.data, TaskBreakdown):
        data = breakdown_data(reply.data)
    elif isinstance(reply.data, Simplification):
        data = simplification_data(reply.data)
    else:
        data = reply.data
    return {
        "intent": str(reply.intent),
        "response": reply.response,
        "mood": str(reply.mood),
        "agentName": str(reply.agent),
        "data": data,
    }


def task_data(task: Task) -> dict:
    return {
        "id": task.id,
        "title": task.title,
        "timeEstimate": task.time_estimate,
        "tag": str(task.tag),
        "priority": str(task.priority),
        "completed": task.completed,
        "whyExplanation": task.why,
        "subtasks": [
            {"id": s.id, "title": s.title, "timeEstimate": s.time_estimate, "completed": s.completed}
            for s in task.steps
        ],
    }
