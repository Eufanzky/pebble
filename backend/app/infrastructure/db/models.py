"""SQLAlchemy tables. Alembic migrations (``backend/migrations``) are generated from this metadata."""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, MetaData, String, Text, Uuid, func
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
    # Insertion order: the list shows tasks in the order they were added.
    seq: Mapped[int] = mapped_column(BigInteger, Identity(), unique=True)
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
