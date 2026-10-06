"""AdaptLens: usage signals, and the suggestions a user dismissed (roadmap 7.6).

Revision ID: 0007
Revises: 0006
Create Date: 2026-10-06 12:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0007'
down_revision: str | None = '0006'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('usage_signals',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('seq', sa.BigInteger(), sa.Identity(always=False), nullable=False),
    sa.Column('kind', sa.String(length=20), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_usage_signals')),
    sa.UniqueConstraint('seq', name=op.f('uq_usage_signals_seq'))
    )
    op.create_index('ix_usage_signals_user_id_seq', 'usage_signals', ['user_id', 'seq'], unique=False)
    op.create_table('suggestion_dismissals',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.String(length=255), nullable=False),
    sa.Column('key', sa.String(length=50), nullable=False),
    sa.Column('dismissed_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_suggestion_dismissals')),
    sa.UniqueConstraint('user_id', 'key', name='uq_suggestion_dismissals_user_key')
    )


def downgrade() -> None:
    op.drop_table('suggestion_dismissals')
    op.drop_index('ix_usage_signals_user_id_seq', table_name='usage_signals')
    op.drop_table('usage_signals')
