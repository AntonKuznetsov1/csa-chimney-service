from fastapi import APIRouter, Depends
from typing import List

from app.core.security import verify_admin_password

router = APIRouter(prefix="/slots", tags=["Slots"])

available_slots = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]

@router.get("/", response_model=List[str])
def get_slots():
    return available_slots

@router.put("/", response_model=List[str])
def update_slots(new_slots: List[str], _: bool = Depends(verify_admin_password)):
    global available_slots
    available_slots = new_slots
    return available_slots