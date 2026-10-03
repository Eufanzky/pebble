"""Progress events: what the user finished, only ever added to (roadmap 5.6).

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-03 14:53:41.571598
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0004'
down_revision: str | None = '0003'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('progress_events',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('kind', sa.String(length=10), nullable=False),
    sa.Column('item_id', sa.String(length=64), nullable=False),
    sa.Column('tag', sa.String(length=20), nullable=True),
    sa.Column('minutes', sa.Integer(), server_default='0', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_progress_events')),
    sa.UniqueConstraint('user_id', 'kind', 'item_id', name='uq_progress_events_user_kind_item')
    )
    op.create_index(op.f('ix_progress_events_user_id'), 'progress_events', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_progress_events_user_id'), table_name='progress_events')
    op.drop_table('progress_events')
