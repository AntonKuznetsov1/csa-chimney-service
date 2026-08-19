import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import DATABASE_URL, Base, engine
import app.db.models  # Registers SQLAlchemy models
from app.api.routes import bookings, services, slots

ROOT_DIR = Path(__file__).resolve().parent.parent
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        alembic_cfg = Config(str(ROOT_DIR / "alembic.ini"))
        alembic_cfg.set_main_option("script_location", str(ROOT_DIR / "alembic"))
        alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)
        command.upgrade(alembic_cfg, "head")
    except Exception:
        logger.exception("Database migration failed during application startup")
        raise
    yield


app = FastAPI(title="CSA Chimney Service API", version="1.0.0", lifespan=lifespan)

raw_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

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