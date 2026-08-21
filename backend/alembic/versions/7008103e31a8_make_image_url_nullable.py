"""make image url nullable

Revision ID: 7008103e31a8
Revises: ff5ce9839211
Create Date: 2026-08-21 11:01:41.929420

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7008103e31a8'
down_revision: Union[str, None] = 'ff5ce9839211'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Safely alter ONLY the image_url column to allow empty/null values
    op.alter_column('blog_posts', 'image_url',
               existing_type=sa.String(),
               nullable=True)


def downgrade() -> None:
    # Revert back to not-null if we ever need to roll back
    op.alter_column('blog_posts', 'image_url',
               existing_type=sa.String(),
               nullable=False)