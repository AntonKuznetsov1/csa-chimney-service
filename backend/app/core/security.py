import os

from fastapi import Header, HTTPException


ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Chimney123").strip()


def verify_admin_password(x_admin_password: str = Header(...)):
    if x_admin_password.strip() != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=401, detail="Unauthorized: Invalid admin password"
        )
    return True
