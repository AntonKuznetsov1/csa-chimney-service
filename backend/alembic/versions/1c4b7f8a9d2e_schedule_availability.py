"""add schedule availability

Revision ID: 1c4b7f8a9d2e
Revises: ff5ce9839211
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "1c4b7f8a9d2e"
down_revision: Union[str, None] = "ff5ce9839211"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "services" not in tables:
        op.create_table(
            "services",
            sa.Column("id", sa.String(length=100), nullable=False),
            sa.Column("title", sa.String(length=150), nullable=False),
            sa.Column("price", sa.Float(), nullable=False),
            sa.Column("duration", sa.String(length=50), nullable=True),
            sa.Column("description", sa.String(length=500), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_services_id", "services", ["id"], unique=False)

    if "bookings" not in tables:
        op.create_table(
            "bookings",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("full_name", sa.String(length=120), nullable=False),
            sa.Column("email", sa.String(length=120), nullable=False),
            sa.Column("phone", sa.String(length=50), nullable=False),
            sa.Column("address", sa.String(length=255), nullable=False),
            sa.Column("service_id", sa.String(length=100), nullable=False),
            sa.Column("service_title", sa.String(length=150), nullable=False),
            sa.Column("price", sa.Float(), nullable=False),
            sa.Column("booking_date", sa.String(length=50), nullable=False),
            sa.Column("booking_time", sa.String(length=50), nullable=False),
            sa.Column("status", sa.String(length=50), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_bookings_id", "bookings", ["id"], unique=False)

    op.create_table(
        "schedule_blocks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("blocked_date", sa.Date(), nullable=False),
        sa.Column("blocked_time", sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "blocked_date", "blocked_time", name="uq_schedule_block_date_time"
        ),
    )
    op.create_index("ix_schedule_blocks_id", "schedule_blocks", ["id"], unique=False)
    op.create_index(
        "ix_schedule_blocks_blocked_date",
        "schedule_blocks",
        ["blocked_date"],
        unique=False,
    )
    op.create_table(
        "schedule_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slots", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "uq_booking_date_time",
        "bookings",
        ["booking_date", "booking_time"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_booking_date_time", table_name="bookings")
    op.drop_table("schedule_settings")
    op.drop_index("ix_schedule_blocks_blocked_date", table_name="schedule_blocks")
    op.drop_index("ix_schedule_blocks_id", table_name="schedule_blocks")
    op.drop_table("schedule_blocks")
