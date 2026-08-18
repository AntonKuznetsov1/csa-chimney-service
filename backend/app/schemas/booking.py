from pydantic import BaseModel, EmailStr
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