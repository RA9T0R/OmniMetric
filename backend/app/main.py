import time
from contextlib import asynccontextmanager
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.config import settings
from app.database import engine, Base
from app.services.ai_service import ai_manager
from app.services.storage import ensure_bucket_public
from app.routers import images,users
from app.models import user, project, analysis

@asynccontextmanager
async def lifespan(app: FastAPI):
    db_connected = False
    for i in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            ensure_bucket_public()
            db_connected = True
            print("✅ Database Connected & Tables Created!")
            break
        except OperationalError:
            print(f"⚠️ Database not ready yet... waiting (Attempt {i + 1}/10)")
            time.sleep(2)  # รอ 2 วินาทีแล้วลองใหม่
        except Exception as e:
            print(f"🔥 Unexpected DB Error: {e}")
            time.sleep(2)

    if not db_connected:
        print("❌ Could not connect to Database after retries. Exiting.")
        raise RuntimeError("Database Connection Failed")
    ai_manager.load_models()
    yield
    print("🛑 Shutting down OmniMetric...")
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router, prefix="/api/v1/images", tags=["Images"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "OmniMetric Backend is Ready 🚀"}