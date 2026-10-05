"""Activity entries keep WhyBot's plain-language explanation (roadmap 7.4).

Revision ID: 0006
Revises: 0005
Create Date: 2026-10-05 22:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0006'
down_revision: str | None = '0005'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('activity_entries', sa.Column('explanation', sa.Text(), server_default='', nullable=False))


def downgrade() -> None:
    op.drop_column('activity_entries', 'explanation')
