from fastapi import APIRouter
from .images import router as images_router
from .users import router as users_router

# This is the main router that main.py talks to
router = APIRouter()

# 1. Connect the Image Logic (Prefix adds /images to all endpoints inside)
router.include_router(images_router, prefix="/images", tags=["Images"])

# 2. Connect the User Logic
router.include_router(users_router, prefix="/users", tags=["Users"])

# 3. General System Health
@router.get("/health-check", tags=["General"])
def health_check():
    return {"status": "System operational"}