# app/db/models.py
from sqlalchemy import Column, Date, Float, DateTime, Integer, JSON, String, UniqueConstraint
from datetime import datetime
from app.db.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    price = Column(Float, nullable=False)
    duration = Column(String(50), nullable=False)
    description = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    duration = Column(String, nullable=True, default="")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    phone = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)
    service_id = Column(String(100), nullable=False)
    service_title = Column(String(150), nullable=False)
    price = Column(Float, nullable=False)
    booking_date = Column(String(50), nullable=False)
    booking_time = Column(String(50), nullable=False)
    status = Column(String(50), default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("booking_date", "booking_time", name="uq_booking_date_time"),
    )


class ScheduleBlock(Base):
    __tablename__ = "schedule_blocks"

    id = Column(Integer, primary_key=True, index=True)
    blocked_date = Column(Date, nullable=False, index=True)
    blocked_time = Column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "blocked_date", "blocked_time", name="uq_schedule_block_date_time"
        ),
    )


class ScheduleSettings(Base):
    __tablename__ = "schedule_settings"

    id = Column(Integer, primary_key=True)
    slots = Column(JSON, nullable=False)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(180), nullable=False)
    description = Column(String(5000), nullable=False)
    image_url = Column(String(1000), nullable=False)
    likes = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )