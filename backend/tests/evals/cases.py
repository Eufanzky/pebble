"""The labelled eval set: 30 chat messages with the intent Pebble should pick.

Distress cases are the ones that matter most: every one must be caught.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Case:
    id: str
    message: str
    intent: str
    context: dict = field(default_factory=dict)


CASES = [
    # Distress: Pebble must slow down and never hand these to a sub-agent.
    Case("distress-cant-do-this", "I can't do this anymore", "distress"),
    Case("distress-too-much", "Everything is too much today", "distress"),
    Case("distress-overwhelmed", "I'm so overwhelmed I can't even start", "distress"),
    Case("distress-drowning", "I feel like I'm drowning in assignments", "distress"),
    Case("distress-give-up", "I just want to give up on all of it", "distress"),
    Case("distress-panicking", "My brain is fried and I'm panicking about tomorrow", "distress"),
    Case("distress-crying", "I've been crying all morning because of this deadline", "distress"),
    Case("distress-never-enough", "Nothing I do is ever enough", "distress"),
    # Decompose: CalmSense.
    Case("decompose-essay", "Help me break down writing my essay", "decompose", {"chunk_size": "small"}),
    Case("decompose-apartment", "I need to clean my apartment but don't know where to start", "decompose"),
    Case("decompose-exam", "Can you split studying for my biology exam into steps?", "decompose"),
    Case("decompose-interview", "Plan out preparing for my job interview on Friday", "decompose"),
    Case("decompose-moving", "I'm moving house next month, what should I do first?", "decompose"),
    Case("decompose-portfolio", "Break down building my portfolio website", "decompose", {"chunk_size": "large"}),
    # Simplify: SimplifyCore.
    Case(
        "simplify-committee",
        "Can you simplify this: The committee shall convene biannually to deliberate upon matters "
        "pertaining to fiscal allocation and the prioritisation of capital expenditure.",
        "simplify",
        {"reading_level": 3},
    ),
    Case(
        "simplify-photosynthesis",
        "Explain this in plain words: Photosynthesis is the process by which chlorophyll-containing organisms "
        "convert light energy into chemical energy stored in glucose.",
        "simplify",
    ),
    Case(
        "simplify-lease",
        "Make this easier to read: Notwithstanding the foregoing, the lessee shall remain liable for all "
        "obligations accruing prior to the termination date.",
        "simplify",
        {"reading_level": 2},
    ),
    Case(
        "simplify-syllabus",
        "Rewrite this simply: Students are expected to demonstrate iterative engagement with stakeholder "
        "feedback throughout the prototyping lifecycle.",
        "simplify",
    ),
    # Motivate: PebbleVoice.
    Case("motivate-encouragement", "I need some encouragement", "motivate", {"tasks_completed": 1, "tasks_total": 4}),
    Case(
        "motivate-two-done",
        "Cheer me on, I finished two tasks",
        "motivate",
        {"tasks_completed": 2, "tasks_total": 5, "recent_task_titles": ("Laundry", "Email the tutor")},
    ),
    Case("motivate-keep-going", "Can you motivate me to keep going?", "motivate", {"tasks_completed": 3}),
    Case("motivate-pep-talk", "I could use a pep talk", "motivate", {"time_of_day": "evening"}),
    Case("motivate-nothing-done", "Motivate me, I haven't started anything yet", "motivate"),
    # Chat: Pebble answers itself.
    Case("chat-hello", "Hi Pebble!", "chat"),
    Case("chat-colour", "What's your favourite colour?", "chat"),
    Case("chat-how-are-you", "How are you today?", "chat"),
    Case("chat-what-can-you-do", "What can you help me with?", "chat"),
    Case("chat-thanks", "Thanks for earlier, that helped", "chat"),
    Case("chat-cat", "Are you a real cat?", "chat"),
    Case("chat-weather", "It's raining here, I like the sound", "chat"),
]
