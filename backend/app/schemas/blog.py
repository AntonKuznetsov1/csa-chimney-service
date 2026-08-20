from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BlogPostBase(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BlogPostBase):
    pass

class BlogPostResponse(BlogPostBase):
    id: int
    likes: int
    created_at: datetime

    class Config:
        from_attributes = True