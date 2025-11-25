from fastapi import APIRouter

router = APIRouter()

@router.get("/profile")
def get_user_profile():
    return {"username": "JoneDoe", "role": "admin"}

@router.get("/status")
def get_user_status():
    return {"active": True}