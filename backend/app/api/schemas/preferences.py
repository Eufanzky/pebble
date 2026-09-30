from pydantic import BaseModel, Field

from app.domain.preferences import ChunkSize, PebbleColor, PebbleModel, PebblePersonality


class PreferencesOut(BaseModel):
    reading_level: int = Field(alias="readingLevel")
    chunk_size: ChunkSize = Field(alias="chunkSize")
    reduce_animations: bool = Field(alias="reduceAnimations")
    calm_mode: bool = Field(alias="calmMode")
    pebble_color: PebbleColor = Field(alias="pebbleColor")
    pebble_personality: PebblePersonality = Field(alias="pebblePersonality")
    pebble_model: PebbleModel = Field(alias="pebbleModel")

    model_config = {"populate_by_name": True, "by_alias": True}


class PreferencesUpdate(BaseModel):
    """Only the fields sent are changed."""

    reading_level: int | None = Field(alias="readingLevel", default=None, ge=1, le=10)
    chunk_size: ChunkSize | None = Field(alias="chunkSize", default=None)
    reduce_animations: bool | None = Field(alias="reduceAnimations", default=None)
    calm_mode: bool | None = Field(alias="calmMode", default=None)
    pebble_color: PebbleColor | None = Field(alias="pebbleColor", default=None)
    pebble_personality: PebblePersonality | None = Field(alias="pebblePersonality", default=None)
    pebble_model: PebbleModel | None = Field(alias="pebbleModel", default=None)

    model_config = {"populate_by_name": True, "extra": "forbid"}
