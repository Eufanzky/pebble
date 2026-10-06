from pydantic import BaseModel, Field


class SuggestionOut(BaseModel):
    key: str
    preference: str = Field(description="The preference it would change: `readingLevel` or `stepSize`.")
    value: int | str
    reason: str


class SuggestionAnswer(BaseModel):
    key: str = Field(min_length=1, max_length=50)
