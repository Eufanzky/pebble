"""How the user likes Pebble to look, speak and pace things."""

from collections.abc import Mapping
from dataclasses import asdict, dataclass, fields
from enum import StrEnum


class ChunkSize(StrEnum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


class PebbleColor(StrEnum):
    LAVENDER = "lavender"
    SAGE = "sage"
    CORAL = "coral"
    AMBER = "amber"
    SKY = "sky"


class PebblePersonality(StrEnum):
    GENTLE = "gentle"
    PLAYFUL = "playful"
    CALM = "calm"


class PebbleModel(StrEnum):
    CLASSIC = "classic"
    CHONKY = "chonky"
    MOCHI = "mochi"
    MINIMAL = "minimal"
    CHONKY_PLUS = "chonky-plus"
    MOCHI_PLUS = "mochi-plus"
    MINIMAL_PLUS = "minimal-plus"


READING_LEVELS = range(1, 11)


@dataclass(frozen=True)
class Preferences:
    """The defaults are what a new user sees (the same as the frontend's)."""

    reading_level: int = 5
    chunk_size: ChunkSize = ChunkSize.MEDIUM
    reduce_animations: bool = False
    calm_mode: bool = False
    pebble_color: PebbleColor = PebbleColor.LAVENDER
    pebble_personality: PebblePersonality = PebblePersonality.GENTLE
    pebble_model: PebbleModel = PebbleModel.CHONKY_PLUS

    @classmethod
    def from_saved(cls, saved: Mapping[str, object]) -> "Preferences":
        """Saved values over the defaults. A missing, unknown or damaged value falls back to its default,
        so a preference added later never breaks an older account."""
        values = {}
        for f in fields(cls):
            if f.name not in saved:
                continue
            value = _parse(f.name, saved[f.name])
            if value is not None:
                values[f.name] = value
        return cls(**values)

    def to_saved(self) -> dict[str, object]:
        return {name: str(value) if isinstance(value, StrEnum) else value for name, value in asdict(self).items()}


_ENUMS: dict[str, type[StrEnum]] = {
    "chunk_size": ChunkSize,
    "pebble_color": PebbleColor,
    "pebble_personality": PebblePersonality,
    "pebble_model": PebbleModel,
}


def _parse(name: str, value: object) -> object | None:
    if name in _ENUMS:
        try:
            return _ENUMS[name](value)
        except ValueError:
            return None
    if name == "reading_level":
        return value if isinstance(value, int) and not isinstance(value, bool) and value in READING_LEVELS else None
    return value if isinstance(value, bool) else None
