"""add blog posts

Revision ID: 2d9f6a1b7c4e
Revises: 1c4b7f8a9d2e
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "2d9f6a1b7c4e"
down_revision: Union[str, None] = "1c4b7f8a9d2e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "blog_posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("description", sa.String(length=5000), nullable=False),
        sa.Column("image_url", sa.String(length=1000), nullable=False),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_blog_posts_id", "blog_posts", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_blog_posts_id", table_name="blog_posts")
    op.drop_table("blog_posts")