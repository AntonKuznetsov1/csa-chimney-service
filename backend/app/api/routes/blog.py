from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import verify_admin_password
from app.db.database import get_db
from app.db.models import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostResponse

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("/", response_model=List[BlogPostResponse])
def get_blog_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()


@router.post("/", response_model=BlogPostResponse, dependencies=[Depends(verify_admin_password)])
def create_blog_post(payload: BlogPostCreate, db: Session = Depends(get_db)):
    post = BlogPost(
        title=payload.title.strip(),
        description=payload.description.strip(),
        image_url=str(payload.image_url),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostResponse, dependencies=[Depends(verify_admin_password)])
def update_blog_post(post_id: int, payload: BlogPostCreate, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    post.title = payload.title.strip()
    post.description = payload.description.strip()
    post.image_url = str(payload.image_url)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", response_model=dict, dependencies=[Depends(verify_admin_password)])
def delete_blog_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    db.delete(post)
    db.commit()
    return {"message": "Blog post deleted successfully"}


@router.post("/{post_id}/like", response_model=BlogPostResponse)
def like_blog_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    post.likes += 1
    db.commit()
    db.refresh(post)
    return post