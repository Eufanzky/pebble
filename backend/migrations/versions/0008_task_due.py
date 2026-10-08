"""A task can have a due day, and when it was chosen (roadmap 8.3).

Revision ID: 0008
Revises: 0007
Create Date: 2026-10-08 20:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0008'
down_revision: str | None = '0007'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('due', sa.Date(), nullable=True))
    op.add_column('tasks', sa.Column('due_set_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('tasks', 'due_set_at')
    op.drop_column('tasks', 'due')
