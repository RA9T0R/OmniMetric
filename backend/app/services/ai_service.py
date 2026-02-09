import tempfile
import cv2
import numpy as np
import torch
import py360convert
from PIL import Image
import io
import requests
from uuid import UUID
import os
import time
import asyncio
import math

from app.models.project import Image as DBImage
from app.services.model_loader import model_loader
from app.utils.analysis import save_analysis_result, save_detected_objects
from app.services.storage import storage_client
from app.config import settings
from app.database import SessionLocal

import depth_pro

def generate_high_res_heatmap(depth_np, original_size=None):
    depth_min = depth_np.min()
    depth_max = depth_np.max()

    if depth_max - depth_min > 1e-5:
        depth_norm = (depth_np - depth_min) / (depth_max - depth_min)
    else:
        depth_norm = np.zeros_like(depth_np)

    depth_uint8 = (depth_norm * 255).astype(np.uint8)
    depth_uint8_inv = 255 - depth_uint8

    heatmap = cv2.applyColorMap(depth_uint8_inv, cv2.COLORMAP_INFERNO)

    if original_size:
        orig_h, orig_w = original_size
        if heatmap.shape[0] != orig_h or heatmap.shape[1] != orig_w:
            heatmap = cv2.resize(heatmap, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)

    return heatmap


def upload_bytes_to_minio(data_bytes: bytes, folder: str, filename: str, content_type: str) -> str | None:
    try:
        full_path = f"{folder}/{filename}"
        storage_client.put_object(
            Bucket=settings.S3_BUCKET,
            Key=full_path,
            Body=data_bytes,
            ContentType=content_type
        )
        endpoint = settings.S3_PUBLIC_URL
        return f"{endpoint}/{settings.S3_BUCKET}/{full_path}"
    except Exception as e:
        print(f"Failed to upload AI result: {e}")
        return None


def get_image_from_minio(image_url: str):
    try:
        download_url = image_url.replace("localhost", "minio")
        resp = requests.get(download_url)
        resp.raise_for_status()
        arr = np.asarray(bytearray(resp.content), dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None


def filter_overlapping_objects(candidates, img_width, threshold_ratio=0.03):
    if not candidates: return []
    candidates.sort(key=lambda x: x['conf'], reverse=True)
    keep = []
    threshold_px = img_width * threshold_ratio

    for current in candidates:
        is_duplicate = False
        curr_cx = (current['box'][0] + current['box'][2]) / 2
        curr_cy = (current['box'][1] + current['box'][3]) / 2

        for kept_item in keep:
            kept_cx = (kept_item['box'][0] + kept_item['box'][2]) / 2
            kept_cy = (kept_item['box'][1] + kept_item['box'][3]) / 2
            dist = math.sqrt((curr_cx - kept_cx) ** 2 + (curr_cy - kept_cy) ** 2)
            if dist < threshold_px:
                is_duplicate = True
                break
        if not is_duplicate:
            keep.append(current)
    return keep


def execute_sniper_inference(original_img, yaw_deg, pitch_deg, device):
    target_fov = 80
    sniper_size = 512

    perspective_crop = py360convert.e2p(
        original_img, fov_deg=target_fov, u_deg=yaw_deg, v_deg=pitch_deg,
        out_hw=(sniper_size, sniper_size), in_rot_deg=0, mode='bilinear'
    )

    f_px_crop_val = (sniper_size / 2.0) / np.tan(np.deg2rad(target_fov) / 2.0)

    d_model, d_transform = model_loader.get_depth_model("ProTypeModel")

    crop_pil = Image.fromarray(cv2.cvtColor(perspective_crop, cv2.COLOR_BGR2RGB))
    crop_input = d_transform(crop_pil).to(device)
    f_px_tensor = torch.tensor(f_px_crop_val).to(device)

    with torch.no_grad():
        prediction = d_model.infer(crop_input, f_px=f_px_tensor)
        depth_crop = prediction["depth"].squeeze().cpu().numpy()

    center_c = sniper_size // 2
    roi = depth_crop[center_c - 2:center_c + 2, center_c - 2:center_c + 2]
    metric_dist = np.median(roi)

    return round(float(metric_dist), 2)


def get_depth_from_saved_npy(bucket_name, object_key, x, y, orig_w, orig_h):
    try:
        response = storage_client.get_object(Bucket=bucket_name, Key=object_key)
        content = response['Body'].read()

        with io.BytesIO(content) as f:
            depth_np = np.load(f)

        d_h, d_w = depth_np.shape
        scale_x = d_w / orig_w
        scale_y = d_h / orig_h

        dx = int(x * scale_x)
        dy = int(y * scale_y)

        dx = min(max(0, dx), d_w - 1)
        dy = min(max(0, dy), d_h - 1)

        dist = depth_np[dy, dx]
        return round(float(dist), 2)
    except Exception as e:
        print(f"Error reading NPY: {e}")
        return None


def process_image_background_task(image_id: UUID):
    print(f"[AI Task] Processing Image: {image_id}")
    db = SessionLocal()

    try:
        db_image = db.query(DBImage).filter(DBImage.image_id == image_id).first()
        if not db_image:
            print(f"[AI Task] Error: DB record for {image_id} not found.")
            return

        original_img = None
        max_retries = 5

        for attempt in range(max_retries):
            original_img = get_image_from_minio(db_image.image_url)

            if original_img is not None and hasattr(original_img, 'shape') and original_img.size > 0:
                print(f"[AI Task] Image successfully downloaded on attempt {attempt + 1}")
                break

            if attempt < max_retries - 1:
                print(f"[AI Task] Image not found in MinIO yet. Retrying in 2s... ({attempt + 1}/{max_retries})")
                time.sleep(2)

        if original_img is None:
            raise ValueError(f"Image Download Failed after {max_retries} attempts for URL: {db_image.image_url}")

        orig_h, orig_w = original_img.shape[:2]
        project = db_image.project
        input_type = project.input_type
        model_name = project.model_name

        device = model_loader.device
        yolo = model_loader.get_yolo()

        detected_objects_data = []
        depth_vis_url = None
        raw_depth_url = None

        if input_type == "Normal":
            print("Mode: Normal Image Pipeline")

            yolo_results = yolo(original_img, device=device, verbose=False)

            depth_np = None

            if model_name == "ProTypeModel":
                max_dim = 1024
                if max(orig_h, orig_w) > max_dim:
                    scale = max_dim / max(orig_h, orig_w)
                    new_w, new_h = int(orig_w * scale), int(orig_h * scale)
                    print(f"Resizing for Depth Pro: {new_w}x{new_h}")
                    resized_img = cv2.resize(original_img, (new_w, new_h))
                    _, encoded_img = cv2.imencode('.jpg', resized_img)
                    image_content = encoded_img.tobytes()
                else:
                    _, encoded_img = cv2.imencode('.jpg', original_img)
                    image_content = encoded_img.tobytes()

                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    tmp.write(image_content)
                    tmp_path = tmp.name

                try:
                    d_model, d_transform = model_loader.get_depth_model("ProTypeModel")
                    torch.set_num_threads(10)

                    image_raw, _, f_px = depth_pro.load_rgb(tmp_path)
                    d_input = d_transform(image_raw).to(device)

                    with torch.no_grad():
                        prediction = d_model.infer(d_input, f_px=f_px)
                        depth_np = prediction["depth"].squeeze().cpu().numpy()
                finally:
                    if os.path.exists(tmp_path): os.remove(tmp_path)

            else:
                d_model, _ = model_loader.get_depth_model("FastTypeModel")
                depth_np = d_model.infer_image(original_img)

            buffer_npy = io.BytesIO()
            np.save(buffer_npy, depth_np)
            raw_depth_url = upload_bytes_to_minio(
                buffer_npy.getvalue(), "analysis/raw", f"raw_{image_id}.npy", "application/octet-stream"
            )

            vis_img = generate_high_res_heatmap(depth_np, original_size=(orig_h, orig_w))
            success, buffer_vis = cv2.imencode(".jpg", vis_img)
            if success:
                depth_vis_url = upload_bytes_to_minio(
                    buffer_vis.tobytes(), "analysis/visual", f"vis_{image_id}.jpg", "image/jpeg"
                )

            d_h, d_w = depth_np.shape
            scale_x = d_w / orig_w
            scale_y = d_h / orig_h

            for result in yolo_results:
                boxes = result.boxes.xyxy.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy()
                confs = result.boxes.conf.cpu().numpy()

                for box, cls, conf in zip(boxes, classes, confs):
                    x1, y1, x2, y2 = map(int, box)
                    label = result.names[int(cls)]

                    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                    dx, dy = int(cx * scale_x), int(cy * scale_y)
                    dx, dy = min(max(0, dx), d_w - 1), min(max(0, dy), d_h - 1)

                    dist_val = round(float(depth_np[dy, dx]), 2)
                    confidence_score = int(float(conf) * 100)

                    box_data = {
                        "top": (y1 / orig_h) * 100,
                        "left": (x1 / orig_w) * 100,
                        "width": ((x2 - x1) / orig_w) * 100,
                        "height": ((y2 - y1) / orig_h) * 100
                    }
                    detected_objects_data.append({
                        "label": label, "confidence": confidence_score,
                        "box_data": box_data, "distance": dist_val
                    })

        elif input_type == "360_degree":
            print("   Mode: Panorama 360 Sniper Pipeline")

            da_model, _ = model_loader.get_depth_model("FastTypeModel")

            depth_vis_np = da_model.infer_image(original_img)
            vis_img = generate_high_res_heatmap(depth_vis_np, original_size=(orig_h, orig_w))

            success, buffer_vis = cv2.imencode(".jpg", vis_img)
            if success:
                depth_vis_url = upload_bytes_to_minio(
                    buffer_vis.tobytes(), "analysis/visual", f"vis_{image_id}.jpg", "image/jpeg"
                )

            yolo_results = yolo(original_img, device=device, verbose=False)
            raw_candidates = []

            for result in yolo_results:
                boxes = result.boxes.xyxy.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy()
                confs = result.boxes.conf.cpu().numpy()
                names = result.names

                for box, cls, conf in zip(boxes, classes, confs):
                    label_name = names[int(cls)]
                    if label_name == 'boat': label_name = 'car'

                    raw_candidates.append({
                        'box': list(map(int, box)),
                        'cls': int(cls), 'conf': float(conf), 'label': label_name
                    })

            filtered_candidates = filter_overlapping_objects(raw_candidates, orig_w, threshold_ratio=0.03)
            print(f"YOLO found {len(raw_candidates)} -> Filtered to {len(filtered_candidates)}")

            model_loader.get_depth_model("ProTypeModel")
            torch.set_num_threads(10)

            for idx, obj in enumerate(filtered_candidates, 1):
                x1, y1, x2, y2 = obj['box']
                label = obj['label']

                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                yaw_deg = (cx / orig_w) * 360 - 180
                pitch_deg = -((cy / orig_h) * 180 - 90)

                print(f"Sniper [{idx}/{len(filtered_candidates)}]: {label}")
                metric_dist = execute_sniper_inference(original_img, yaw_deg, pitch_deg, device)

                val_conf = obj['conf']
                confidence_score = int(val_conf) if val_conf > 1.0 else int(val_conf * 100)

                box_data = {
                    "top": (y1 / orig_h) * 100, "left": (x1 / orig_w) * 100,
                    "width": ((x2 - x1) / orig_w) * 100, "height": ((y2 - y1) / orig_h) * 100
                }
                detected_objects_data.append({
                    "label": label, "confidence": confidence_score,
                    "box_data": box_data, "distance": metric_dist
                })

        # 4. Save Results
        save_analysis_result(
            db, image_id,
            depth_map_visual_url=depth_vis_url,
            raw_depth_file_url=raw_depth_url,
            calibration_data={"focal_length": 500}
        )
        save_detected_objects(db, image_id, detected_objects_data)

        # 5. Success
        db_image.status = "done"
        db.commit()
        print(f"Image {image_id} processed successfully.")

    except Exception as e:
        print(f"Processing Error: {e}")
        db.rollback()
        # Safe fail update
        try:
            err_img = db.query(DBImage).filter(DBImage.image_id == image_id).first()
            if err_img:
                err_img.status = "failed"
                db.commit()
        except:
            pass
    finally:
        db.close()