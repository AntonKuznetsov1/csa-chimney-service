from pydantic import BaseModel, Field
from typing import Optional


class ServiceCreate(BaseModel):
    id: Optional[str] = None
    title: str
    price: float
    description: str = Field(default="")

    class Config:
        from_attributes = True


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceResponse(BaseModel):
    id: str
    title: str
    price: float
    description: str

    class Config:
        from_attributes = True