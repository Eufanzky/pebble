"""Errors use cases raise. Their messages are safe to show to the user."""


class PromptAttackError(Exception):
    def __init__(self) -> None:
        super().__init__("Prompt injection attack detected. Pebble can only respond to genuine, safe requests.")


class UnsafeContentError(Exception):
    def __init__(self) -> None:
        super().__init__("Content flagged by safety filter. Pebble can only provide safe, supportive responses.")


class UnsafeOutputError(Exception):
    """The model's reply was flagged. Callers replace it with a safe reply rather than showing an error."""


class AgentReplyError(Exception):
    """The model answered, but not with the JSON the agent asked for."""
