from fastapi import FastAPI, UploadFile, File
from .router import router as process_router

from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="OmniMetric",
    description="Spatial Intelligence API for 3D Reconstruction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(process_router)

