"""A task the user let go is kept, with when, off their list (roadmap 8.4).

Revision ID: 0009
Revises: 0008
Create Date: 2026-10-08 22:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0009'
down_revision: str | None = '0008'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('let_go_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('tasks', 'let_go_at')
