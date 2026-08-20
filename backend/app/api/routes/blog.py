import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
import httpx

from app.db.database import get_db
from app.db.models import BlogPost
from app.schemas.blog import BlogPostResponse

router = APIRouter(prefix="/blog", tags=["blog"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "blog-images")

def verify_admin(x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")

# Helper function to handle the Supabase image upload
async def upload_to_supabase(file: UploadFile) -> str:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_URL and SUPABASE_KEY environment variables are not configured."
        )

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_bytes = await file.read()

    storage_url = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/{SUPABASE_BUCKET}/{filename}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "ApiKey": SUPABASE_KEY,
        "Content-Type": file.content_type or "image/jpeg"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(storage_url, content=file_bytes, headers=headers)
        
    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=500,
            detail=f"Supabase upload failed: {response.text}"
        )

    public_url = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{SUPABASE_BUCKET}/{filename}"
    return public_url


@router.get("/", response_model=List[BlogPostResponse])
def get_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(desc(BlogPost.created_at)).all()


@router.post("/", response_model=BlogPostResponse)
async def create_post(
    title: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    image_url = None
    if image:
        image_url = await upload_to_supabase(image)

    db_post = BlogPost(
        title=title,
        description=description,
        image_url=image_url,
        likes=0
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_post(
    post_id: int,
    title: str = Form(...),
    description: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin)
):
    db_post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_post.title = title
    db_post.description = description
    
    if image:
        db_post.image_url = await upload_to_supabase(image)
    
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