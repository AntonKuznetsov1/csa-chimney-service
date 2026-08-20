# app/db/models.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func  # <--- Add Text here
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


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    likes = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())