# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

# Base Schema
class UserBase(BaseModel):
    username: str
    email: EmailStr

# สิ่งที่รับมาตอน Register
class UserCreate(UserBase):
    password: str

# สิ่งที่ส่งกลับ (Response)
class UserResponse(UserBase):
    user_id: UUID
    profile_picture_url: Optional[str] = None
    credit_balance: float
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 2. สิ่งที่ส่งกลับเมื่อ Login ผ่าน (Token)
class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None