import torch
import numpy as np
from PIL import Image
import io
import traceback  # Used for better error logging
from ultralytics import YOLO
from transformers import pipeline

# Global variable to hold the initialized AI engine instance
engine = None


class AIEngine:
    def __init__(self):
        # 1. Initialize Models (This is the most likely crash point)
        print("⏳ Loading AI Models...")
        try:
            # YOLO: For Object Detection
            self.yolo_model = YOLO('yolo11n.pt')
            # Depth Estimation: HuggingFace pipeline for Depth Anything V2
            self.depth_estimator = pipeline(
                task="depth-estimation",
                model="depth-anything/Depth-Anything-V2-Small-hf",
                device="cuda" if torch.cuda.is_available() else "cpu"
            )
            print("✅ AI Models Loaded Successfully!")
        except Exception as e:
            print(f"FATAL ERROR LOADING AI MODELS: {e}")
            raise RuntimeError("Failed to initialize AI models. Check dependencies and GPU memory.")

    def run_depth_on_slice(self, pil_img):
        """Runs the depth estimation on a single image slice."""
        result = self.depth_estimator(pil_img)
        d = np.array(result["depth"])

        # Normalize depth map to 0-1
        d = (d - d.min()) / (d.max() - d.min())
        return d

    def process_panorama_views(self, pil_image):
        """Processes a 360 image by cutting it into 3 undistorted views and stitching."""
        w, h = pil_image.size
        num_patches = 3
        patch_width = w // num_patches

        depth_map_sum = np.zeros((h, w), dtype=np.float32)
        count = np.zeros((h, w), dtype=np.int32)

        for i in range(num_patches):
            start_x = i * patch_width
            end_x = start_x + patch_width
            slice_img = pil_image.crop((start_x, 0, end_x, h))
            depth_slice = self.run_depth_on_slice(slice_img)

            depth_map_sum[:, start_x:end_x] += depth_slice
            count[:, start_x:end_x] += 1

        depth_map = np.divide(depth_map_sum, count, out=np.zeros_like(depth_map_sum), where=count != 0)

        # Filter: Remove top/bottom 5% (poles) which are always noisy in 360 processing
        depth_map[:int(h * 0.05), :] = 0
        depth_map[-int(h * 0.05):, :] = 0

        return depth_map

    def process_image(self, image_bytes):
        global engine
        if engine is None:
            engine = AIEngine()

        # We must wrap this in a try/except to prevent server crash on bad input
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

            # Enforce max width for faster processing
            max_width = 1024
            if pil_image.width > max_width:
                ratio = max_width / pil_image.width
                new_height = int(pil_image.height * ratio)
                pil_image = pil_image.resize((max_width, new_height))

            width, height = pil_image.size

            aspect_ratio = width / height
            is_panorama = 1.9 < aspect_ratio < 2.1

            if is_panorama:
                depth_map = self.process_panorama_views(pil_image)
            else:
                depth_map = self.run_depth_on_slice(pil_image)

            # --- DEPTH FILTERING AND SCALING ---
            valid_mask = (depth_map > 0.05) & (depth_map < 0.99)
            inv_depth = 1.0 - depth_map

            MIN_DISTANCE = 0.5
            MAX_RANGE = 15.0  # Increased range for slightly larger rooms
            z_values_map = (np.power(inv_depth, 1.5) * MAX_RANGE) + MIN_DISTANCE

            # 3. YOLO AND OBJECT PROCESSING (Skipped for brevity, but same as before)
            yolo_results = self.yolo_model(pil_image)
            detected_objects = []

            for result in yolo_results:
                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    label = self.yolo_model.names[int(box.cls[0].item())]

                    obj_crop = z_values_map[int(y1):int(y2), int(x1):int(x2)]
                    avg_depth = np.median(obj_crop) if obj_crop.size > 0 else 0

                    cx = (x1 + x2) / 2
                    cy = (y1 + y2) / 2
                    r = avg_depth

                    if is_panorama:
                        theta = (cx / width) * 2 * np.pi - np.pi
                        phi = (np.pi / 2) - (cy / height) * np.pi
                        pos = [r * np.cos(phi) * np.sin(theta), r * np.sin(phi), r * np.cos(phi) * np.cos(theta)]
                    else:
                        focal_length = width  # Use width as focal length for a standard 90 degree FOV look
                        pos = [
                            (cx - width / 2) * r / focal_length,
                            -(cy - height / 2) * r / focal_length,
                            -r
                        ]

                    detected_objects.append({
                        "label": label,
                        "confidence": round(box.conf[0].item(), 2),
                        "distance": round(avg_depth, 2),
                        "position": pos
                    })

            # 4. GENERATE POINT CLOUD DATA
            step = 2
            x_grid, y_grid = np.meshgrid(np.arange(0, width, step), np.arange(0, height, step))
            mask_downsampled = valid_mask[::step, ::step].flatten()

            x_flat = x_grid.flatten()[mask_downsampled]
            y_flat = y_grid.flatten()[mask_downsampled]

            img_array = np.array(pil_image)
            colors = img_array[::step, ::step, :].reshape(-1, 3) / 255.0
            colors_flat = colors.reshape(-1, 3)[mask_downsampled].flatten()

            z_values = z_values_map[::step, ::step].flatten()[mask_downsampled]

            if is_panorama:
                # SPHERICAL MAPPING
                theta = (x_flat / width) * 2 * np.pi - np.pi
                phi = (np.pi / 2) - (y_flat / height) * np.pi
                r = z_values

                real_x = r * np.cos(phi) * np.sin(theta)
                real_y = r * np.sin(phi)
                real_z = r * np.cos(phi) * np.cos(theta)

            else:
                # PINHOLE MAPPING (CORRECTED FLAT MATH)
                focal_length = width  # Use width as focal length (guarantees flat projection)
                cx = width / 2
                cy = height / 2

                real_x = (x_flat - cx) * z_values / focal_length
                real_y = -(y_flat - cy) * z_values / focal_length
                real_z = -z_values

            positions = np.column_stack((real_x, real_y, real_z)).flatten()

            return {
                "positions": positions.tolist(),
                "colors": colors_flat.tolist(),
                "objects": detected_objects,
                "is_panorama": is_panorama
            }

        except Exception as e:
            error_message = f"Processing failed: {type(e).__name__} - {e}\nTraceback: {traceback.format_exc()}"
            print(f"CRITICAL BACKEND ERROR: {error_message}")
            # Raise an HTTPException so the Frontend knows to show the red error box
            raise RuntimeError(
                f"Processing failed. Check terminal logs for detailed traceback. Error: {type(e).__name__}")


# Initialize the engine once
try:
    engine = AIEngine()
except:
    # If the initial load fails, the engine variable stays None
    engine = None