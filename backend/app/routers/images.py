import traceback
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.services.storage import storage_client
from app.services.ai_service import ai_manager
from app.models.project import Image as ImageModel
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_image(
        background_tasks: BackgroundTasks,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    try:
        print(f"🔹 Start Uploading: {file.filename}")  # Debug 1

        # 1. อ่านไฟล์
        content = await file.read()
        print(f"🔹 File Read Size: {len(content)} bytes")  # Debug 2

        # 2. Upload ขึ้น S3
        file_ext = file.filename.split(".")[-1]
        new_filename = f"uploads/{uuid.uuid4()}.{file_ext}"
        print(f"🔹 Uploading to S3 as: {new_filename}")  # Debug 3

        url = storage_client.upload_file(content, new_filename, file.content_type)
        print(f"✅ Upload Success: {url}")  # Debug 4

        # 3. Save ลง Database
        print("🔹 Saving to Database...")  # Debug 5
        db_image = ImageModel(image_url=url, status="processing")

        db.add(db_image)
        db.commit()
        print("✅ DB Commit Success")  # Debug 6

        db.refresh(db_image)
        print(f"✅ DB Refresh Success ID: {db_image.image_id}")  # Debug 7

        # 4. ส่ง Background Task
        background_tasks.add_task(process_ai_task, db_image.image_id, content)
        print("✅ Background Task Added")  # Debug 8

        return {"id": db_image.image_id, "url": url, "status": "processing"}

    except Exception as e:
        # นี่คือจุดสำคัญ! ถ้าพัง มันจะปริ้น Error ตัวแดงๆ ออกมาให้เราเห็น
        print("🔥 CRITICAL ERROR IN UPLOAD 🔥")
        traceback.print_exc()  # ปริ้นบรรทัดที่พังออกมา
        # ส่ง 500 พร้อมข้อความ Error กลับไปที่หน้าเว็บด้วย (จะได้ไม่ต้องเดา)
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


async def process_ai_task(image_id, content, db: Session):  # ลบ db ออกจาก argument ก็ได้ แต่ถ้าแก้เยอะเดี๋ยวค่อยว่ากัน
    # สร้าง Session ใหม่เฉพาะกิจสำหรับงานนี้
    db_task = SessionLocal()
    try:
        print(f"🚀 Starting AI for image {image_id}")
        # ... logic เดิม ...

        # เวลา query หรือ commit ให้ใช้ db_task แทน db
        image = db_task.query(ImageModel).filter(ImageModel.image_id == image_id).first()
        # ...
        db_task.commit()

    except Exception as e:
        print(f"🔥 AI Failed: {e}")
        db_task.rollback()
    finally:
        db_task.close()  # อย่าลืมปิด!