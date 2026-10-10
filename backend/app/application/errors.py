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


class AgentCallsLimitedError(Exception):
    """This user called the agents too often (10.4); they can again in ``retry_after`` seconds."""

    def __init__(self, retry_after: int) -> None:
        super().__init__(f"Too many agent calls; try again in {retry_after} s.")
        self.retry_after = retry_after
