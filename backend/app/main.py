import time
from contextlib import asynccontextmanager
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.config import settings
from app.database import engine, Base
from app.services.storage import ensure_bucket_public
from app.models import user, project, analysis
from app.routers import projects,users,analysis
from app.services.model_loader import model_loader


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
            time.sleep(2)
        except Exception as e:
            print(f"🔥 Unexpected DB Error: {e}")
            time.sleep(2)

    try:
        model_loader.load_models()
    except Exception as e:
        print(f"❌ Failed to load AI Models: {e}")

    if not db_connected:
        print("❌ Could not connect to Database after retries. Exiting.")
        raise RuntimeError("Database Connection Failed")

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

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])

@app.get("/")
def root():
    return {"message": "OmniMetric Backend is Ready 🚀"}