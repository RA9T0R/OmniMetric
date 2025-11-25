from fastapi import APIRouter

router = APIRouter()

@router.get("/Try")
def get_image_try():
    return {"Image":"This is for test"}