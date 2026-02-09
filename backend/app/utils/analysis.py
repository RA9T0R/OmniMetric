from sqlalchemy.orm import Session
from app.models.analysis import AnalysisResult,DetectedObject
from uuid import UUID
from typing import Optional, Any, List, Dict

def save_analysis_result(
        db: Session,
        image_id: UUID,
        depth_map_visual_url: Optional[str] = None,
        raw_depth_file_url: Optional[str] = None,
        calibration_data: Optional[Any] = None
) -> AnalysisResult:
    existing_result = db.query(AnalysisResult).filter(AnalysisResult.image_id == image_id).first()

    if existing_result:
        if depth_map_visual_url is not None:
            existing_result.depth_map_visual_url = depth_map_visual_url
        if raw_depth_file_url is not None:
            existing_result.raw_depth_file_url = raw_depth_file_url
        if calibration_data is not None:
            existing_result.calibration_data = calibration_data

        db_obj = existing_result
    else:
        db_obj = AnalysisResult(
            image_id=image_id,
            depth_map_visual_url=depth_map_visual_url,
            raw_depth_file_url=raw_depth_file_url,
            calibration_data=calibration_data
        )
        db.add(db_obj)

    try:
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except Exception as e:
        db.rollback()
        raise e


def save_detected_objects(
        db: Session,
        image_id: UUID,
        objects_data: List[Dict[str, Any]]
):
    db.query(DetectedObject).filter(DetectedObject.image_id == image_id).delete()

    new_objects = []
    for obj in objects_data:
        new_obj = DetectedObject(
            image_id=image_id,
            label=obj["label"],
            confidence=obj.get("confidence"),
            box_data=obj.get("box_data"),
            distance=obj.get("distance")
        )
        new_objects.append(new_obj)
    db.add_all(new_objects)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e