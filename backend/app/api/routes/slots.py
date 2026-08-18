from fastapi import APIRouter, Header, HTTPException
from typing import List

router = APIRouter(prefix="/slots", tags=["Slots"])

available_slots = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]

# Match this to your actual admin password or env variable
ADMIN_PASSWORD = "password"  # Replace with your actual admin password or use an environment variable

@router.get("/", response_model=List[str])
def get_slots():
    return available_slots

@router.put("/", response_model=List[str])
def update_slots(new_slots: List[str], x_admin_password: str = Header(...)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    global available_slots
    available_slots = new_slots
    return available_slots