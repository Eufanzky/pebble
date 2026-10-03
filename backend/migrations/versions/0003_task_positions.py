"""Task positions: the user's own order (roadmap 5.5).

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-03 14:22:15.137875
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0003'
down_revision: str | None = '0002'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('position', sa.Integer(), server_default='0', nullable=False))
    # Existing lists keep the order they had: the order tasks were added in
    op.execute(
        """
        UPDATE tasks SET position = ranked.position
        FROM (SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY seq) AS position FROM tasks) AS ranked
        WHERE tasks.id = ranked.id
        """
    )


def downgrade() -> None:
    op.drop_column('tasks', 'position')
