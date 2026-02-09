import torch
import os
import inspect
from ultralytics import YOLO
import depth_pro
from depth_anything_v2.dpt import DepthAnythingV2


class ModelManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"🖥️  AI Computing Device: {cls._instance.device}")

            cls._instance.yolo = None
            cls._instance.depth_pro_model = None
            cls._instance.depth_pro_transform = None
            cls._instance.depth_anything = None
        return cls._instance

    def load_models(self):
        print("⏳ Loading AI Models from local checkpoints...")

        base_path = "app/checkpoints"

        # --- 1. Load YOLO ---
        try:
            yolo_path = os.path.join(base_path, "yolo", "yolo11n.pt")
            if os.path.exists(yolo_path):
                print(f"📂 Loading YOLO from: {yolo_path}")
                self.yolo = YOLO(yolo_path)
                print("✅ YOLOv11 (Nano) Loaded successfully.")
            else:
                print(f"⚠️  File not found: {yolo_path}")
                self.yolo = YOLO("yolo11n.pt")
        except Exception as e:
            print(f"❌ Failed to load YOLO: {e}")

        # --- 2. Load Depth Pro (The Magic Fix) ---
        try:
            dp_path = os.path.join(base_path, "depth_pro", "depth_pro.pt")  # แก้ให้ตรงกับ path จริงของคุณ

            if os.path.exists(dp_path):
                print(f"   📂 Loading Depth Pro from: {dp_path}")

                sig = inspect.signature(depth_pro.create_model_and_transforms)
                cfg = sig.parameters['config'].default

                cfg.checkpoint_uri = dp_path

                self.depth_pro_model, self.depth_pro_transform = depth_pro.create_model_and_transforms(
                    config=cfg,
                    device=self.device
                )

                self.depth_pro_model.eval()
                print("✅ Depth Pro Loaded successfully (Config Hacked).")
            else:
                print(f"⚠️  Depth Pro checkpoint not found at {dp_path}")
                self.depth_pro_model, self.depth_pro_transform = depth_pro.create_model_and_transforms(
                    device=self.device
                )
                print("✅ Depth Pro Loaded (Default).")

        except Exception as e:
            print(f"❌ Failed to load Depth Pro: {e}")

        # --- 3. Load Depth Anything V2 ---
        try:
            encoder = 'vitb'
            model_configs = {
                'vits': {'encoder': 'vits', 'features': 64, 'out_channels': [48, 96, 192, 384]},
                'vitb': {'encoder': 'vitb', 'features': 128, 'out_channels': [96, 192, 384, 768]},
                'vitl': {'encoder': 'vitl', 'features': 256, 'out_channels': [256, 512, 1024, 1024]},
            }

            self.depth_anything = DepthAnythingV2(**model_configs[encoder])

            da_path = os.path.join(base_path, "depth_anything_v2", f"depth_anything_v2_{encoder}.pth")

            if os.path.exists(da_path):
                print(f"   📂 Loading Depth Anything from: {da_path}")
                self.depth_anything.load_state_dict(torch.load(da_path, map_location='cpu'))
                self.depth_anything = self.depth_anything.to(self.device).eval()
                print(f"✅ Depth Anything V2 ({encoder}) Loaded successfully.")
            else:
                print(f"❌ Depth Anything weights not found at: {da_path}")

        except Exception as e:
            print(f"❌ Failed to load Depth Anything V2: {e}")

    def get_yolo(self):
        return self.yolo

    def get_depth_model(self, model_type: str):
        if model_type == "ProTypeModel":
            return self.depth_pro_model, self.depth_pro_transform
        elif model_type == "FastTypeModel":
            return self.depth_anything, None
        else:
            return self.depth_pro_model, self.depth_pro_transform


model_loader = ModelManager()