"""SQLAlchemy tables. Alembic migrations (``backend/migrations``) are generated from this metadata."""

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    MetaData,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# Named constraints, so migrations can drop and rename them by name.
NAMING = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING)


class Timestamps:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class TaskRow(Timestamps, Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)
    # Insertion order, and the tie-break for equal positions.
    seq: Mapped[int] = mapped_column(BigInteger, Identity(), unique=True)
    # The user's order (5.5); new tasks go last.
    position: Mapped[int] = mapped_column(Integer, server_default="0")
    title: Mapped[str] = mapped_column(Text)
    time_estimate: Mapped[str] = mapped_column(String(50))
    tag: Mapped[str] = mapped_column(String(20))
    priority: Mapped[str] = mapped_column(String(10))
    completed: Mapped[bool]
    why: Mapped[str] = mapped_column(Text)

    steps: Mapped[list["StepRow"]] = relationship(
        order_by="StepRow.position", cascade="all, delete-orphan", passive_deletes=True, lazy="selectin"
    )


class StepRow(Base):
    __tablename__ = "task_steps"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    task_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"), index=True)
    position: Mapped[int]
    title: Mapped[str] = mapped_column(Text)
    time_estimate: Mapped[str] = mapped_column(String(50))
    completed: Mapped[bool]


class PreferencesRow(Timestamps, Base):
    """Only what the user saved, as JSON: a preference added later needs no migration, and a missing one
    falls back to its default (``Preferences.from_saved``)."""

    __tablename__ = "preferences"

    user_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    values: Mapped[dict] = mapped_column(JSONB)


class ActivityRow(Base):
    __tablename__ = "activity_entries"
    __table_args__ = (Index("ix_activity_entries_user_id_seq", "user_id", "seq"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255))
    # Insertion order, newest last: ties in created_at can't reorder the log.
    seq: Mapped[int] = mapped_column(BigInteger, Identity(), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    agent: Mapped[str] = mapped_column(String(20))
    action: Mapped[str] = mapped_column(Text)
    reasoning: Mapped[str] = mapped_column(Text)
    safety_status: Mapped[str] = mapped_column(String(10))


class ProgressRow(Base):
    """What the user finished (5.6). Only ever added to: one row per finished task or step, and per focus session."""

    __tablename__ = "progress_events"
    __table_args__ = (UniqueConstraint("user_id", "kind", "item_id", name="uq_progress_events_user_kind_item"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)
    kind: Mapped[str] = mapped_column(String(10))
    item_id: Mapped[str] = mapped_column(String(64))
    tag: Mapped[str | None] = mapped_column(String(20))
    minutes: Mapped[int] = mapped_column(Integer, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
