import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.db.models  # Registers SQLAlchemy models
from app.api.routes import bookings, services, slots

app = FastAPI(title="CSA Chimney Service API", version="1.0.0")

raw_origins = os.getenv("ALLOWED_ORIGINS", "")
configured_origins = [
    origin.strip().rstrip("/").strip('"').strip("'")
    for origin in raw_origins.split(",")
    if origin.strip()
]
origins = list(
    dict.fromkeys(
        configured_origins
        + [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://csachimney.com",
            "https://www.csachimney.com",
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bookings.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(slots.router, prefix="/api")


@app.get("/")
def read_root():
    return {"status": "ok", "service": "CSA Chimney API"}