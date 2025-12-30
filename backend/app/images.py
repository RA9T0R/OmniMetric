from fastapi import APIRouter, UploadFile, File, HTTPException
import asyncio
from .ai_engine import engine  # Import the Real AI Brain

router = APIRouter()

# --- MOCK DATABASE (In-Memory) ---
db_simulation = {}


# --- API ENDPOINTS ---

@router.get("/test")
def get_image_try():
    return {"message": "Image module is active"}


@router.post("/upload")
async def upload_scan(file: UploadFile = File(...)):
    """
    URL: POST /images/upload
    Logic: Receives file -> Runs REAL AI -> Returns 3D Data
    """
    # 1. Read File (Async)
    content = await file.read()

    # 2. Run Real AI (in a separate thread to not block the server)
    print(f"Processing {file.filename}...")
    loop = asyncio.get_event_loop()

    # This calls engine.process_image(content)
    try:
        result_data = await loop.run_in_executor(None, engine.process_image, content)
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Save to Mock DB
    scan_id = "test-scan-001"
    db_simulation[scan_id] = result_data

    print("Processing Complete!")

    # 4. Return Success
    return {
        "scan_id": scan_id,
        "status": "completed",
        "filename": file.filename,
        "data": result_data
    }


@router.get("/{scan_id}")
def get_scan_result(scan_id: str):
    data = db_simulation.get(scan_id)
    if not data:
        raise HTTPException(status_code=404, detail="Scan not found")
    return data