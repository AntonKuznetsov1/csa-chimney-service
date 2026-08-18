import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base[cite: 17]
import app.db.models  # Registers SQLAlchemy models
from app.api.routes import bookings, services, slots[cite: 17]

Base.metadata.create_all(bind=engine)[cite: 17]

app = FastAPI(title="CSA Chimney Service API", version="1.0.0")[cite: 17]

# Parse allowed origins from environment variable or default to local development[cite: 17]
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)[cite: 17]

app.include_router(bookings.router, prefix="/api")[cite: 17]
app.include_router(services.router, prefix="/api")[cite: 17]
app.include_router(slots.router, prefix="/api")[cite: 17]

@app.get("/")
def read_root():
    return {"status": "ok", "service": "CSA Chimney API"}[cite: 17]