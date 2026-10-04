"""Saved preferences call the step size `step_size`, not `chunk_size` (roadmap 6.6).

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-04 18:00:00
"""

from collections.abc import Sequence

from alembic import op

revision: str = '0005'
down_revision: str | None = '0004'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _rename_key(old: str, new: str) -> None:
    op.execute(
        f"""
        UPDATE preferences
        SET "values" = ("values" - '{old}') || jsonb_build_object('{new}', "values" -> '{old}')
        WHERE "values" ? '{old}'
        """
    )


def upgrade() -> None:
    _rename_key('chunk_size', 'step_size')


def downgrade() -> None:
    _rename_key('step_size', 'chunk_size')
