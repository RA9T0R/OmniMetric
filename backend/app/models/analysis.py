from sqlalchemy import Column, ForeignKey, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid


class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    result_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    image_id = Column(UUID(as_uuid=True), ForeignKey("images.image_id", ondelete="CASCADE"), unique=True,nullable=False)

    depth_map_visual_url = Column(Text, nullable=True)  # รูป Heatmap ที่คนดูรู้เรื่อง
    raw_depth_file_url = Column(Text, nullable=True)  # ไฟล์ .npy สำหรับคำนวณ
    calibration_data = Column(JSON, nullable=True)  # เก็บค่า Intrinsics กล้อง

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    image = relationship("Image", back_populates="analysis_result")