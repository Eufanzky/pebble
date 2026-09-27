"""Pebble's named agents, and the intents and moods the chat works with."""

from enum import StrEnum


class AgentName(StrEnum):
    CALM_SENSE = "CalmSense"
    SIMPLIFY_CORE = "SimplifyCore"
    PEBBLE_VOICE = "PebbleVoice"
    ADAPT_LENS = "AdaptLens"
    WHY_BOT = "WhyBot"
    BRIDGE_BOT = "BridgeBot"


class Intent(StrEnum):
    DECOMPOSE = "decompose"
    SIMPLIFY = "simplify"
    MOTIVATE = "motivate"
    CHAT = "chat"
    DISTRESS = "distress"

    @classmethod
    def parse(cls, value: object) -> "Intent":
        """An unknown or missing intent is plain chat."""
        try:
            return cls(value)
        except ValueError:
            return cls.CHAT


class Mood(StrEnum):
    SLEEPY = "sleepy"
    NORMAL = "normal"
    HAPPY = "happy"
    EXCITED = "excited"

    @classmethod
    def parse(cls, value: object) -> "Mood":
        """An unknown or missing mood is normal: Pebble can only show these four."""
        try:
            return cls(value)
        except ValueError:
            return cls.NORMAL
