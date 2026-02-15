from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
import asyncio
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from app.database import get_db
from app.models.project import Image
from app.models.user import User
from app.routers.users import get_current_user
from app.services.ai_service import (
    process_image_background_task,
    get_image_from_minio,
    get_depth_from_saved_npy,
    execute_sniper_inference_pro,
    execute_sniper_inference_fast,
)
from app.services.model_loader import model_loader
from app.config import settings

router = APIRouter()


class MeasurePointRequest(BaseModel):
    image_id: UUID
    x: int
    y: int


COST_MEASURE_360 = 2

@router.post("/images/{image_id}/process")
async def trigger_image_analysis(
        image_id: UUID,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    image = None
    retries = 3
    wait_time = 1.0

    for attempt in range(retries):
        image = db.query(Image).filter(Image.image_id == image_id).first()
        if image:
            break
        if attempt < retries - 1:
            await asyncio.sleep(wait_time)
            db.expire_all()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found. Upload may not be complete.")

    image.status = "processing"
    db.commit()

    background_tasks.add_task(process_image_background_task, image_id)

    return {"message": "AI processing started", "status": "processing"}


@router.post("/measure-point")
async def measure_point_manual(
        req: MeasurePointRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    image = db.query(Image).filter(Image.image_id == req.image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    if image.project.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    input_type = image.project.input_type

    if input_type == '360_degree':
        try:
            user_to_charge = db.query(User).filter(User.user_id == current_user.user_id).with_for_update().first()

            if user_to_charge.credit_balance < COST_MEASURE_360:
                raise HTTPException(
                    status_code=402,
                    detail=f"Insufficient credit for AI Measurement. Required: {COST_MEASURE_360}, Balance: {user_to_charge.credit_balance}"
                )

            user_to_charge.credit_balance -= COST_MEASURE_360
            db.commit()
        except HTTPException as he:
            db.rollback()
            raise he
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Transaction failed")

    if input_type == 'Normal':
        if not image.analysis_result or not image.analysis_result.raw_depth_file_url:
            raise HTTPException(status_code=400, detail="Depth data not found. Please process image first.")

        file_url = image.analysis_result.raw_depth_file_url
        object_key = file_url.split(f"{settings.S3_BUCKET}/")[-1]

        original_img = get_image_from_minio(image.image_url)
        if original_img is None:
            raise HTTPException(status_code=500, detail="Cannot load original image")

        orig_h, orig_w = original_img.shape[:2]

        distance = get_depth_from_saved_npy(
            settings.S3_BUCKET, object_key,
            req.x, req.y,
            orig_w, orig_h
        )

        if distance is None:
            raise HTTPException(status_code=500, detail="Failed to retrieve depth data")

        return {"distance": distance, "unit": "meters"}

    elif input_type == '360_degree':
        original_img = get_image_from_minio(image.image_url)
        if original_img is None:
            raise HTTPException(status_code=500, detail="Cannot load original image")
        h, w = original_img.shape[:2]
        cx, cy = req.x, req.y

        yaw_deg = (cx / w) * 360 - 180
        pitch_deg = -((cy / h) * 180 - 90)

        print(f"Manual Measure: Pixel({cx},{cy}) -> Yaw:{yaw_deg:.2f}, Pitch:{pitch_deg:.2f}")

        try:
            model_name = image.project.model_name

            if model_name == "ProTypeModel":
                dist = execute_sniper_inference_pro(original_img, yaw_deg, pitch_deg, model_loader.device)
            else:
                dist = execute_sniper_inference_fast(original_img, yaw_deg, pitch_deg, {}, model_loader.device)

            return {"distance": dist, "unit": "meters"}

        except Exception as e:
            print(f"Sniper Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    else:
        raise HTTPException(status_code=400, detail="Unknown Project Type")

    return None