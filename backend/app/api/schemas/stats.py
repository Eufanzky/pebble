from datetime import date

from pydantic import BaseModel, Field


class FocusSession(BaseModel):
    minutes: int = Field(ge=1, le=180)


class TotalsOut(BaseModel):
    tasks: int
    steps: int
    focus_minutes: int = Field(alias="focusMinutes")

    model_config = {"populate_by_name": True, "by_alias": True}


class DayOut(TotalsOut):
    date: date


class ByTagOut(BaseModel):
    study: int
    communication: int
    project: int
    wellbeing: int


class StatsOut(BaseModel):
    start: date
    end: date
    totals: TotalsOut
    by_tag: ByTagOut = Field(alias="byTag")
    days: list[DayOut]
    all_time: TotalsOut = Field(alias="allTime")

    model_config = {"populate_by_name": True, "by_alias": True}
