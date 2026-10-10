import pytest

from app.domain.preferences import PebbleColor, PebbleModel, Preferences, StepSize


def test_nothing_saved_is_the_defaults():
    assert Preferences.from_saved({}) == Preferences()


def test_saved_values_override_the_defaults():
    saved = {"reading_level": 3, "step_size": "small", "calm_mode": True, "pebble_model": "mochi-plus"}

    prefs = Preferences.from_saved(saved)

    assert prefs == Preferences(
        reading_level=3, step_size=StepSize.SMALL, calm_mode=True, pebble_model=PebbleModel.MOCHI_PLUS
    )


@pytest.mark.parametrize(
    "saved",
    [
        {"reading_level": 0},
        {"reading_level": 11},
        {"reading_level": "5"},
        {"reading_level": True},
        {"step_size": "huge"},
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


@pytest.mark.parametrize(
    ("saved", "expected"),
    [("07:05", "07:05"), ("23:59", "23:59"), ("", ""), ("24:00", ""), ("7:05", ""), (705, ""), (None, "")],
)
def test_a_saved_reminder_time_is_kept_only_when_it_is_hh_mm(saved, expected):
    assert Preferences.from_saved({"reminder_time": saved}).reminder_time == expected


def test_reminders_are_off_by_default():
    assert (Preferences().reminder_time, Preferences().reminder_notifications) == ("", False)
