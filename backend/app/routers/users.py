from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import timedelta
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token, UserUpdate
from app.utils.security import hash_password, verify_password, create_access_token
from app.services.storage import upload_file
from app.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # ค้นหา User ใน DB
    user = db.query(UserModel).filter(UserModel.user_id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. เช็คก่อนว่า Email นี้เคยสมัครยัง?
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. สร้าง User Model (พร้อมเข้ารหัสรหัสผ่าน)
    new_user = UserModel(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password) # <--- สำคัญมาก! ห้ามเก็บ plaintext
    )

    # 3. บันทึกลง Database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. ส่งข้อมูลกลับ (FastAPI จะแปลงเป็น UserResponse ให้อัตโนมัติ ตัด password ทิ้ง)
    return new_user


@router.post("/login", response_model=Token)
def login_for_access_token(form_data: UserLogin, db: Session = Depends(get_db)):
    # 1. ค้นหา User จาก Email
    user = db.query(UserModel).filter(UserModel.email == form_data.email).first()

    # 2. ถ้าไม่เจอ User หรือ รหัสผ่านผิด
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. ถ้าถูกต้อง -> สร้าง Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.user_id)},  # ใส่ User ID เข้าไปใน Token (เรียกว่า sub)
        expires_delta=access_token_expires
    )

    # 4. ส่ง Token กลับไป
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
        user_update: UserUpdate,
        current_user: UserModel = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    # 1. Update Username
    if user_update.username:
        current_user.username = user_update.username

    # 2. Update Email (ต้องเช็คก่อนว่าซ้ำคนอื่นไหม)
    if user_update.email and user_update.email != current_user.email:
        check_user = db.query(UserModel).filter(UserModel.email == user_update.email).first()
        if check_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email

    # 3. Update Password (ต้องมี Old Password มายืนยัน)
    if user_update.new_password:
        if not user_update.old_password:
            raise HTTPException(status_code=400, detail="Old password is required to set new password")

        if not verify_password(user_update.old_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect old password")

        current_user.password_hash = hash_password(user_update.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/avatar", response_model=UserResponse)
def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. เช็คว่าเป็นไฟล์รูปภาพไหม
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    # 2. อัปโหลดขึ้น MinIO
    image_url = upload_file(file, folder="profile_pictures")

    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")

    # 3. อัปเดต URL ลง Database
    current_user.profile_picture_url = image_url
    db.commit()
    db.refresh(current_user)

    return current_user