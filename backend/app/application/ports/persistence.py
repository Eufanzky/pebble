"""What every store port raises when it can't do its job."""


class PersistenceError(Exception):
    """The store can't be reached or isn't configured."""
