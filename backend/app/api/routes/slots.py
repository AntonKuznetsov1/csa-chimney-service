from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import verify_admin_password
from app.db.database import get_db
from app.db.models import Booking, ScheduleBlock, ScheduleSettings

router = APIRouter(prefix="/slots", tags=["Slots"])

available_slots = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]


class ScheduleConfig(BaseModel):
    slots: List[str]
    blocked_dates: List[date] = Field(default_factory=list)
    blocked_slots: List[dict] = Field(default_factory=list)


def get_config(db: Session):
    settings = db.query(ScheduleSettings).filter(ScheduleSettings.id == 1).first()
    configured_slots = settings.slots if settings else available_slots
    blocks = db.query(ScheduleBlock).order_by(ScheduleBlock.blocked_date).all()
    return {
        "slots": configured_slots,
        "blocked_dates": sorted(
            {block.blocked_date.isoformat() for block in blocks if block.blocked_time is None}
        ),
        "blocked_slots": [
            {"date": block.blocked_date.isoformat(), "time": block.blocked_time}
            for block in blocks
            if block.blocked_time is not None
        ],
    }

@router.get("/", response_model=List[str])
def get_slots(
    booking_date: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    if booking_date is None:
        return []

    blocks = db.query(ScheduleBlock).filter(ScheduleBlock.blocked_date == booking_date).all()
    if any(block.blocked_time is None for block in blocks):
        return []
    blocked_times = {block.blocked_time for block in blocks}
    settings = db.query(ScheduleSettings).filter(ScheduleSettings.id == 1).first()
    configured_slots = settings.slots if settings else available_slots
    booked_times = {
        booking.booking_time
        for booking in db.query(Booking).filter(Booking.booking_date == booking_date.isoformat()).all()
    }
    return [slot for slot in configured_slots if slot not in blocked_times and slot not in booked_times]


@router.get("/config", dependencies=[Depends(verify_admin_password)])
def get_schedule_config(db: Session = Depends(get_db)):
    return get_config(db)

@router.put("/", response_model=List[str])
def update_slots(
    new_slots: List[str],
    _: bool = Depends(verify_admin_password),
):
    global available_slots
    available_slots = [slot.strip() for slot in new_slots if slot.strip()]
    settings = db.query(ScheduleSettings).filter(ScheduleSettings.id == 1).first()
    if settings:
        settings.slots = available_slots
    else:
        db.add(ScheduleSettings(id=1, slots=available_slots))
    db.commit()
    return available_slots


@router.put("/config", dependencies=[Depends(verify_admin_password)])
def update_schedule_config(payload: ScheduleConfig, db: Session = Depends(get_db)):
    global available_slots
    normalized_slots = list(dict.fromkeys(slot.strip() for slot in payload.slots if slot.strip()))
    if not normalized_slots:
        raise HTTPException(status_code=400, detail="At least one available slot is required")

    db.query(ScheduleBlock).delete()
    settings = db.query(ScheduleSettings).filter(ScheduleSettings.id == 1).first()
    if settings:
        settings.slots = normalized_slots
    else:
        db.add(ScheduleSettings(id=1, slots=normalized_slots))
    for blocked_date in payload.blocked_dates:
        db.add(ScheduleBlock(blocked_date=blocked_date, blocked_time=None))
    for blocked_slot in payload.blocked_slots:
        blocked_date = blocked_slot.get("date")
        blocked_time = str(blocked_slot.get("time", "")).strip()
        if not blocked_date or not blocked_time:
            raise HTTPException(status_code=400, detail="Blocked slots require a date and time")
        db.add(ScheduleBlock(blocked_date=date.fromisoformat(blocked_date), blocked_time=blocked_time))
    db.commit()
    available_slots = normalized_slots
    return get_config(db)