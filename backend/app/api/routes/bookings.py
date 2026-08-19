import os
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import verify_admin_password
from app.db.database import get_db
from app.db.models import Booking, ScheduleBlock, Service
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.email import send_booking_email, send_status_update_email

router = APIRouter(prefix="/bookings", tags=["bookings"])


class BookingStatusUpdate(BaseModel):
    status: str
    recipient_email: str
    subject: str
    message: str


@router.post("/", response_model=BookingResponse)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    try:
        booking_date = date.fromisoformat(payload.bookingDate)
    except ValueError:
        raise HTTPException(status_code=400, detail="Booking date must use YYYY-MM-DD format")

    blocked = (
        db.query(ScheduleBlock)
        .filter(ScheduleBlock.blocked_date == booking_date)
        .filter(
            (ScheduleBlock.blocked_time.is_(None))
            | (ScheduleBlock.blocked_time == payload.bookingTime)
        )
        .first()
    )
    if blocked:
        raise HTTPException(status_code=409, detail="That date or time is unavailable")

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.booking_date == payload.bookingDate,
            Booking.booking_time == payload.bookingTime,
        )
        .first()
    )
    if existing_booking:
        raise HTTPException(status_code=409, detail="That time has already been booked")

    service = db.query(Service).filter(Service.id == payload.serviceId).first()
    if service:
        payload.serviceTitle = service.title
        payload.price = service.price

    db_booking = Booking(
        full_name=payload.fullName,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        service_id=payload.serviceId,
        service_title=payload.serviceTitle,
        price=payload.price,
        booking_date=payload.bookingDate,
        booking_time=payload.bookingTime,
    )
    db.add(db_booking)
    try:
        db.commit()
    except Exception as error:
        db.rollback()
        if "uq_booking_date_time" in str(error):
            raise HTTPException(status_code=409, detail="That time has already been booked")
        raise
    db.refresh(db_booking)

    send_booking_email(db_booking)
    return db_booking


@router.get(
    "/",
    response_model=List[BookingResponse],
    dependencies=[Depends(verify_admin_password)],
)
def get_bookings(db: Session = Depends(get_db)):
    return db.query(Booking).order_by(Booking.created_at.desc()).all()


@router.patch(
    "/{booking_id}/status",
    response_model=BookingResponse,
    dependencies=[Depends(verify_admin_password)],
)
def update_booking_status(
    booking_id: int, payload: BookingStatusUpdate, db: Session = Depends(get_db)
):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db_booking.status = payload.status
    db.commit()
    db.refresh(db_booking)

    send_status_update_email(
        to_email=payload.recipient_email,
        subject=payload.subject,
        body=payload.message,
    )

    return db_booking