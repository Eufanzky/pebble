"""Preferences and the activity log (roadmap 4.2).

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-29 21:59:18.129568
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '0002'
down_revision: str | None = '0001'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('activity_entries',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('seq', sa.BigInteger(), sa.Identity(always=False), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('agent', sa.String(length=20), nullable=False),
    sa.Column('action', sa.Text(), nullable=False),
    sa.Column('reasoning', sa.Text(), nullable=False),
    sa.Column('safety_status', sa.String(length=10), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_activity_entries')),
    sa.UniqueConstraint('seq', name=op.f('uq_activity_entries_seq'))
    )
    op.create_index('ix_activity_entries_user_id_seq', 'activity_entries', ['user_id', 'seq'], unique=False)
    op.create_table('preferences',
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('values', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('user_id', name=op.f('pk_preferences'))
    )


def downgrade() -> None:
    op.drop_table('preferences')
    op.drop_index('ix_activity_entries_user_id_seq', table_name='activity_entries')
    op.drop_table('activity_entries')
