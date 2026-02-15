from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from app.services.ai_service import process_image_background_task
from app.database import get_db
from app.models.project import Project, Image
from app.models.user import User, Transaction
from app.schemas.project import ProjectCreate, ProjectResponse, ImageResponse, SceneSummary
from app.routers.users import get_current_user
from app.services.storage import upload_file, delete_file
from app.config import settings

router = APIRouter()

@router.post("/create_bulk", response_model=ProjectResponse)
def create_project_with_images_bulk(
        background_tasks: BackgroundTasks,
        title: str = Form(...),
        model_name: str = Form(...),
        input_type: str = Form(...),
        files: List[UploadFile] = File(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    model_price = settings.PRICING["models"].get(model_name, 0)
    input_price = settings.PRICING["inputs"].get(input_type, 0)
    price_per_image = model_price + input_price

    total_images = len(files)
    total_cost = price_per_image * total_images

    try:
        user_to_charge = db.query(User).filter(User.user_id == current_user.user_id).with_for_update().first()

        if user_to_charge.credit_balance < total_cost:
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient credit. Total Required: {total_cost}, Balance: {user_to_charge.credit_balance}"
            )

        user_to_charge.credit_balance -= total_cost

        new_transaction = Transaction(
            user_id=current_user.user_id,
            amount=-total_cost,
            type='spend'
        )
        db.add(new_transaction)

        new_project = Project(
            user_id=current_user.user_id,
            title=title,
            input_type=input_type,
            model_name=model_name
        )
        db.add(new_project)
        db.flush()

        new_images = []
        for file in files:
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")

            image_url = upload_file(
                file,
                folder="projects",
                user_id=str(current_user.user_id),
                project_id=str(new_project.project_id)
            )

            if not image_url:
                raise HTTPException(status_code=500, detail="Failed to upload image to storage")

            img_record = Image(
                project_id=new_project.project_id,
                image_name=file.filename,
                image_url=image_url,
                status="pending",
                upload_date=datetime.now(timezone.utc)
            )
            db.add(img_record)
            new_images.append(img_record)

        db.commit()
        db.refresh(new_project)

        print(f"DEBUG: Bulk create success. Deducted {total_cost}. Transaction ID: {new_transaction.transaction_id}")

        for img in new_images:
            db.refresh(img)
            background_tasks.add_task(process_image_background_task, img.image_id)

        return new_project

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print(f"CRITICAL BULK ERROR: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during bulk creation")

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
                delete_file(image.analysis_result.depth_map_visual_url)
            if image.analysis_result.raw_depth_file_url:
                delete_file(image.analysis_result.raw_depth_file_url)
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

    model_price = settings.PRICING["models"].get(project.model_name, 0)
    input_price = settings.PRICING["inputs"].get(project.input_type, 0)
    total_cost = model_price + input_price

    try:
        user_to_charge = db.query(User).filter(User.user_id == current_user.user_id).with_for_update().first()

        if user_to_charge.credit_balance < total_cost:
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient credit. Required: {total_cost}, Balance: {user_to_charge.credit_balance}"
            )

        user_to_charge.credit_balance -= total_cost

        new_transaction = Transaction(
            user_id=current_user.user_id,
            amount=-total_cost,
            type='spend'
        )
        db.add(new_transaction)

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

        print(f"DEBUG: Single Upload Deducted {total_cost}. Transaction ID: {new_transaction.transaction_id}")

        background_tasks.add_task(process_image_background_task, new_image.image_id)

        return new_image

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during processing")


@router.get("/{project_id}/scenes", response_model=List[SceneSummary])
def get_project_scenes(
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

    results = db.query(
        Image.scene_label,
        func.count(Image.image_id).label("count")
    ).filter(
        Image.project_id == project_id,
        Image.scene_label.isnot(None),
        Image.scene_label != ""
    ).group_by(
        Image.scene_label
    ).order_by(
        func.count(Image.image_id).desc()
    ).all()

    return [{"label": row[0], "count": row[1]} for row in results]