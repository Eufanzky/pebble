import pytest

from app.domain.preferences import ChunkSize, PebbleColor, PebbleModel, Preferences


def test_nothing_saved_is_the_defaults():
    assert Preferences.from_saved({}) == Preferences()


def test_saved_values_override_the_defaults():
    saved = {"reading_level": 3, "chunk_size": "small", "calm_mode": True, "pebble_model": "mochi-plus"}

    prefs = Preferences.from_saved(saved)

    assert prefs == Preferences(
        reading_level=3, chunk_size=ChunkSize.SMALL, calm_mode=True, pebble_model=PebbleModel.MOCHI_PLUS
    )


@pytest.mark.parametrize(
    "saved",
    [
        {"reading_level": 0},
        {"reading_level": 11},
        {"reading_level": "5"},
        {"reading_level": True},
        {"chunk_size": "huge"},
        {"pebble_color": None},
        {"calm_mode": "yes"},
        {"retired_setting": 1},
    ],
)
def test_a_damaged_or_unknown_value_falls_back_to_the_default(saved):
    assert Preferences.from_saved(saved) == Preferences()


def test_saved_form_round_trips():
    prefs = Preferences(reading_level=8, pebble_color=PebbleColor.SKY, reduce_animations=True)

    saved = prefs.to_saved()

    assert saved["pebble_color"] == "sky"
    assert Preferences.from_saved(saved) == prefs
