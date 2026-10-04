"""Domain results as the JSON the frontend reads (camelCase, the ``ChatResponse`` shape)."""

from app.domain.activity import ActivityEntry
from app.domain.chat import ChatReply
from app.domain.documents import Simplification
from app.domain.preferences import Preferences
from app.domain.progress import ProgressSummary, Totals
from app.domain.tasks import Task, TaskBreakdown


def breakdown_data(breakdown: TaskBreakdown) -> dict:
    return {
        "steps": [{"title": s.title, "timeEstimate": s.time_estimate} for s in breakdown.steps],
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
        "steps": [
            {"id": s.id, "title": s.title, "timeEstimate": s.time_estimate, "completed": s.completed}
            for s in task.steps
        ],
    }


def preferences_data(preferences: Preferences) -> dict:
    return {
        "readingLevel": preferences.reading_level,
        "stepSize": str(preferences.step_size),
        "reduceAnimations": preferences.reduce_animations,
        "calmMode": preferences.calm_mode,
        "pebbleColor": str(preferences.pebble_color),
        "pebblePersonality": str(preferences.pebble_personality),
        "pebbleModel": str(preferences.pebble_model),
    }


def activity_data(entry: ActivityEntry) -> dict:
    return {
        "id": entry.id,
        "timestamp": entry.timestamp,
        "agent": str(entry.agent),
        "action": entry.action,
        "reasoning": entry.reasoning,
        "safetyStatus": str(entry.safety_status),
    }


def _totals(totals: Totals) -> dict:
    return {"tasks": totals.tasks, "steps": totals.steps, "focusMinutes": totals.focus_minutes}


def stats_data(summary: ProgressSummary) -> dict:
    return {
        "start": summary.start,
        "end": summary.end,
        "totals": _totals(summary.totals),
        "byTag": {str(tag): count for tag, count in summary.by_tag.items()},
        "days": [{"date": day.day, **_totals(day.totals)} for day in summary.days],
        "allTime": _totals(summary.all_time),
    }
