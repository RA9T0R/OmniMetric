from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import timedelta
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token, UserUpdate
from app.utils.security import hash_password, verify_password, create_access_token
from app.services.storage import upload_file,delete_file
from app.config import settings

router = APIRouter()
security = HTTPBearer()

async def get_current_user(token_obj: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = token_obj.credentials

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

    user = db.query(UserModel).filter(UserModel.user_id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = UserModel(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login_for_access_token(form_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == form_data.email).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.user_id)},
        expires_delta=access_token_expires
    )

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
    if user_update.username:
        current_user.username = user_update.username

    if user_update.email and user_update.email != current_user.email:
        check_user = db.query(UserModel).filter(UserModel.email == user_update.email).first()
        if check_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email

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
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    if current_user.profile_picture_url:
        delete_file(current_user.profile_picture_url)

    image_url = upload_file(file, folder="profile_pictures")

    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")

    current_user.profile_picture_url = image_url
    db.commit()
    db.refresh(current_user)

    return current_user