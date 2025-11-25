from fastapi import APIRouter
from .images import router as images
from .users import router as users

router = APIRouter()

router.include_router(images, prefix="/images", tags=["images"])
router.include_router(users, prefix="/users", tags=["users"])

@router.get("/health-check", tags=["general"])
def health_check():
    return {"status": "System operational"}