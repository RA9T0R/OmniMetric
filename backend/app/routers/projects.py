from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from app.services.ai_service import process_image_background_task
from app.database import get_db
from app.models.project import Project, Image
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ImageResponse
from app.routers.users import get_current_user
from app.services.storage import upload_file, delete_file

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_project = Project(
        user_id=current_user.user_id,
        title=project_data.title,
        input_type=project_data.input_type,
        model_name=project_data.model_name
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/", response_model=List[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(Project.user_id == current_user.user_id).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_detail(
        project_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.images.sort(key=lambda x: x.upload_date, reverse=True)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
        project_id: UUID,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for image in project.images:
        if image.analysis_result:
            if image.analysis_result.depth_map_visual_url:
                print(f"Deleting Visual Map for Image: {image.image_id}")
                delete_file(image.analysis_result.depth_map_visual_url)

            if image.analysis_result.raw_depth_file_url:
                print(f"Deleting Raw Depth for Image: {image.image_id}")
                delete_file(image.analysis_result.raw_depth_file_url)

        print(f"Deleting Original Image: {image.image_id}")
        delete_file(image.image_url)

    db.delete(project)
    db.commit()

    return None

@router.post("/{project_id}/images", response_model=ImageResponse)
def upload_image_to_project(
    project_id: UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.project_id == project_id,
        Project.user_id == current_user.user_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_url = upload_file(
        file,
        folder="projects",
        user_id=str(current_user.user_id),
        project_id=str(project_id)
    )

    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")

    new_image = Image(
        project_id=project.project_id,
        image_name=file.filename,
        image_url=image_url,
        status="pending",
        upload_date=datetime.now(timezone.utc)
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    print(f"DEBUG: Sending Image ID {new_image.image_id} to AI Service") # เช็ค Log ได้เลย
    background_tasks.add_task(process_image_background_task, new_image.image_id)

    return new_image