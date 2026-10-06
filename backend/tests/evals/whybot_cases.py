"""Labelled WhyBot cases (7.9): what an agent was asked, what it did, the settings, and what the "why" must name.

``names`` lists words the explanation must mention at least one of: the setting that mattered, so the user
knows what to change.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class WhyCase:
    id: str
    agent: str
    asked: str
    did: str
    settings: str
    names: tuple[str, ...]


WHY_CASES = [
    WhyCase(
        "calmsense-small-evening",
        "CalmSense",
        '"Write my history essay"',
        "Split it into 4 steps: Open the prompt (~5 min); Write 3 bullet points (~10 min); Draft the intro "
        "(~10 min); Read it once (~5 min). Its own reason: Starting small.",
        "step size small; time of day evening",
        ("small",),
    ),
    WhyCase(
        "calmsense-large-morning",
        "CalmSense",
        '"Build my portfolio website"',
        "Split it into 3 steps: Pick a template (~30 min); Write the about page (~45 min); Add three projects "
        "(~60 min). Its own reason: Fewer, bigger blocks.",
        "step size large; time of day morning",
        ("large",),
    ),
    WhyCase(
        "calmsense-medium-day",
        "CalmSense",
        '"Clean the apartment"',
        "Split it into 3 steps: Clear the table (~15 min); Do the dishes (~20 min); Vacuum one room (~15 min). "
        "Its own reason: One room at a time.",
        "step size medium; time of day day",
        ("medium",),
    ),
    WhyCase(
        "simplifycore-level-2",
        "SimplifyCore",
        '"The committee shall convene biannually to deliberate upon fiscal allocation…"',
        'Rewrote the text at reading level 2, starting "The group meets twice a year to talk about money". '
        "Action items: none. Its own reason: Short words and one idea per sentence.",
        "reading level 2 of 10",
        ("level 2", "2"),
    ),
    WhyCase(
        "simplifycore-level-7",
        "SimplifyCore",
        '"Students must submit the lab report via the portal by Friday 17:00…"',
        'Rewrote the text at reading level 7, starting "Submit your lab report on the portal by Friday at 5 pm". '
        "Action items: Submit the lab report. Its own reason: Kept the deadline and the action.",
        "reading level 7 of 10",
        ("level 7", "7"),
    ),
    WhyCase(
        "pebblevoice-two-done",
        "PebbleVoice",
        '"some encouragement"',
        'Said "You finished 2 things today. That counts."',
        "2 of 5 tasks done today; time of day afternoon; personality gentle",
        ("2", "two"),
    ),
    WhyCase(
        "pebblevoice-nothing-done",
        "PebbleVoice",
        '"some encouragement"',
        'Said "Today can be a slow day. One tiny thing is plenty."',
        "0 of 4 tasks done today; time of day evening; personality calm",
        ("evening", "calm", "0", "none", "nothing"),
    ),
    WhyCase(
        "pebblevoice-distress",
        "PebbleVoice",
        '"Everything is too much today"',
        'Answered right away, without making a task or calling another agent: "That sounds really hard. '
        'Would you like to start smaller?"',
        "0 of 6 tasks done today; time of day morning; personality gentle",
        ("too much", "hard", "overwhelm", "right away"),
    ),
    WhyCase(
        "adaptlens-reading-level",
        "AdaptLens",
        "to change the default reading level to 3",
        "Suggested it, and you accepted. What it noticed: You picked level 3 for 4 of your last 5 documents. "
        "Your default is 5.",
        "reading level was the default before",
        ("level 3", "3"),
    ),
    WhyCase(
        "adaptlens-step-size",
        "AdaptLens",
        "to change the default step size to large",
        "Suggested it, and you accepted. What it noticed: You finished 3 of your last 4 broken-down tasks with "
        "most of their steps still open.",
        "step size was the default before",
        ("large", "step"),
    ),
]
