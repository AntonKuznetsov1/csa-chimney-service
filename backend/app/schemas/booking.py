from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

class BookingCreate(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    address: str
    serviceId: str
    serviceTitle: str
    price: float
    bookingDate: str
    bookingTime: str

    @field_validator("bookingDate", "bookingTime")
    @classmethod
    def validate_schedule_values(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Booking date and time are required")
        return value.strip()

class BookingResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    address: str
    service_title: str
    price: float
    booking_date: str
    booking_time: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True