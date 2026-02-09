from sqlalchemy import Column, ForeignKey, DateTime, String, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    result_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    image_id = Column(UUID(as_uuid=True), ForeignKey("images.image_id", ondelete="CASCADE"), unique=True,
                      nullable=False)

    depth_map_visual_url = Column(String, nullable=True)
    raw_depth_file_url = Column(String, nullable=True)
    calibration_data = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Image (One-to-One)
    image = relationship("Image", back_populates="analysis_result")

class DetectedObject(Base):
    __tablename__ = "detected_objects"
    object_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    image_id = Column(UUID(as_uuid=True), ForeignKey("images.image_id", ondelete="CASCADE"), nullable=False)

    label = Column(String(100), nullable=False)  # ชื่อวัตถุ
    confidence = Column(Float, nullable=True)  # ความมั่นใจ AI (0.0 - 1.0)
    box_data = Column(JSON, nullable=True)  # เก็บ bounding box {x, y, w, h}
    distance = Column(Float, nullable=True)  # ระยะห่าง

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Image (Many-to-One)
    image = relationship("Image", back_populates="detected_objects")