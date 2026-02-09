from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Project(Base):
    __tablename__ = "projects"
    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    title = Column(String(100), nullable=False)
    input_type = Column(String(25), nullable=True)  # Normal, 360_degree
    model_name = Column(String(50), nullable=True)  # FastTypeModel, ProTypeModel
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # User (Many-to-One)
    user = relationship("User", back_populates="projects")
    # Images (One-to-Many)
    images = relationship("Image", back_populates="project", cascade="all, delete")

class Image(Base):
    __tablename__ = "images"
    image_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=True)

    image_name = Column(String(255))
    scene_label = Column(String(50))
    image_url = Column(Text, nullable=False)
    status = Column(String(25), default='pending')
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    # Project (Many-to-One)
    project = relationship("Project", back_populates="images")
    # Detected Objects (One-to-Many)
    analysis_result = relationship("AnalysisResult", back_populates="image", uselist=False, cascade="all, delete")
    # Detected Objects (One-to-Many)
    detected_objects = relationship("DetectedObject", back_populates="image", cascade="all, delete-orphan")