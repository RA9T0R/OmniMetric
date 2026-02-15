from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime
from uuid import UUID

class DetectedObjectBase(BaseModel):
    object_id: UUID
    label: str
    confidence: Optional[float]
    box_data: Optional[Dict[str, Any]]
    distance: Optional[float]

    class Config:
        from_attributes = True

class AnalysisResultBase(BaseModel):
    depth_map_visual_url: Optional[str] = None
    raw_depth_file_url: Optional[str] = None
    calibration_data: Optional[Any] = None

    class Config:
        from_attributes = True

# --- Image Schemas ---
class ImageBase(BaseModel):
    image_name: Optional[str] = None
    scene_label: Optional[str] = None

class ImageResponse(BaseModel):
    image_id: UUID
    image_url: str
    image_name: str
    status: str
    upload_date: datetime

    scene_label: Optional[str]

    analysis_result: Optional[AnalysisResultBase] = None
    detected_objects: List[DetectedObjectBase] = []

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: str
    input_type: Optional[str]
    model_name: Optional[str]

class ProjectCreate(ProjectBase):
    title: str
    input_type: str = "Normal"
    model_name: str = "ProTypeModel"

class ProjectResponse(BaseModel):
    project_id: UUID
    user_id: UUID
    title: str
    input_type: str
    model_name: str
    created_at: datetime
    images: List[ImageResponse] = []

    class Config:
        from_attributes = True

class SceneSummary(BaseModel):
    label: str
    count: int

    class Config:
        from_attributes = True