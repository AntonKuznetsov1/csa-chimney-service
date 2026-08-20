from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    description: str = Field(min_length=1, max_length=5000)
    image_url: HttpUrl


class BlogPostResponse(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    likes: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
