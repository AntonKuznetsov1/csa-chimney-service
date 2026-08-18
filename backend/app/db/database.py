import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Fetch database URL from Render environment or fallback to SQLite locally
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./csa_chimney.db")[cite: 18]

# Fix Render's legacy 'postgres://' protocol prefix for SQLAlchemy 2.0+
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}[cite: 18]

engine = create_engine(DATABASE_URL, connect_args=connect_args)[cite: 18]

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)[cite: 18]
Base = declarative_base()[cite: 18]

def get_db():
    db = SessionLocal()[cite: 18]
    try:
        yield db[cite: 18]
    finally:
        db.close()[cite: 18]