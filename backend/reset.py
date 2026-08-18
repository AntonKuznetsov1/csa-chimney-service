# reset_db.py
from app.db.database import engine, Base
# Import all model classes so SQLAlchemy detects them before dropping/creating
from app.db import models 

def reset_database():
    print("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating clean tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset successfully!")

if __name__ == "__main__":
    reset_database()