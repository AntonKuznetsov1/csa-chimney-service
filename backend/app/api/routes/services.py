import os
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse

router = APIRouter(prefix="/services", tags=["services"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")


def verify_admin_password(x_admin_password: str = Header(...)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid admin password")
    return True


@router.get("/", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).order_by(Service.title.asc()).all()


@router.post("/", response_model=ServiceResponse, dependencies=[Depends(verify_admin_password)])
def create_service(payload: ServiceCreate, db: Session = Depends(get_db)):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Service title is required")

    # Generate a clean URL-safe slug ID removing characters like &, ?, /, etc.
    if payload.id:
        generated_id = payload.id.strip()
    else:
        slug = payload.title.strip().lower().replace(" ", "-")
        generated_id = re.sub(r'[^a-z0-9\-]', '', slug)[:100]

    db_service = Service(
        id=generated_id,
        title=payload.title.strip(),
        price=payload.price,
        description=payload.description or "",
    )

    existing = db.query(Service).filter(Service.id == db_service.id).first()
    if existing:
        db_service.id = f"{db_service.id}-{len(db.query(Service).all()) + 1}"

    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


@router.put("/{service_id}", response_model=ServiceResponse, dependencies=[Depends(verify_admin_password)])
def update_service(service_id: str, payload: ServiceUpdate, db: Session = Depends(get_db)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    if payload.title is not None:
        db_service.title = payload.title.strip()
    if payload.price is not None:
        db_service.price = payload.price
    if payload.description is not None:
        db_service.description = payload.description.strip()

    db.commit()
    db.refresh(db_service)
    return db_service


@router.delete("/{service_id}", response_model=dict, dependencies=[Depends(verify_admin_password)])
def delete_service(service_id: str, db: Session = Depends(get_db)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    db.delete(db_service)
    db.commit()
    return {"message": "Service deleted successfully"}