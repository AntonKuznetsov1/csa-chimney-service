import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.database import get_db
from app.db.models import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse

router = APIRouter(prefix="/blog", tags=["blog"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

def verify_admin(x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")

@router.get("/", response_model=List[BlogPostResponse])
def get_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(desc(BlogPost.created_at)).all()


@router.post("/", response_model=BlogPostResponse)
async def create_post(
    post: BlogPostCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    db_post = BlogPost(
        title=post.title,
        description=post.description,
        image_url=post.image_url,
        likes=0
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_post(
    post_id: int,
    post: BlogPostUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    db_post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_post.title = post.title
    db_post.description = post.description
    db_post.image_url = post.image_url
    
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    db_post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(db_post)
    db.commit()
    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_post.likes += 1
    db.commit()
    db.refresh(db_post)
    return {"id": db_post.id, "likes": db_post.likes}