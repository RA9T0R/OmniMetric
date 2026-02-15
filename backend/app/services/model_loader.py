import torch
import os
import inspect
from ultralytics import YOLO
import depth_pro
from depth_anything_v2.dpt import DepthAnythingV2
import torchvision.transforms as transforms
import torchvision.models as models
import urllib.request
from torch.nn import functional as F


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

            cls._instance.scene_model = None
            cls._instance.scene_labels = []

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

        # --- 2. Load Depth Pro ---
        try:
            dp_path = os.path.join(base_path, "depth_pro", "depth_pro.pt")
            if os.path.exists(dp_path):
                print(f"   📂 Loading Depth Pro from: {dp_path}")
                sig = inspect.signature(depth_pro.create_model_and_transforms)
                cfg = sig.parameters['config'].default
                cfg.checkpoint_uri = dp_path
                self.depth_pro_model, self.depth_pro_transform = depth_pro.create_model_and_transforms(
                    config=cfg, device=self.device
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

        # --- 4. Load Scene Recognition Model (PRELOAD HERE) ---
        try:
            self.get_scene_model()
        except Exception as e:
            print(f"❌ Failed to load Scene Model: {e}")

    def get_yolo(self):
        return self.yolo

    def get_depth_model(self, model_type: str):
        if model_type == "ProTypeModel":
            return self.depth_pro_model, self.depth_pro_transform
        elif model_type == "FastTypeModel":
            return self.depth_anything, None
        else:
            return self.depth_pro_model, self.depth_pro_transform

    def get_scene_model(self):
        if self.scene_model is not None:
            return self.scene_model, self.scene_labels

        print("Loading Scene Recognition Model (ResNet50-Places365)...")
        try:
            self.scene_model = models.resnet50(weights=None)

            num_ftrs = self.scene_model.fc.in_features
            self.scene_model.fc = torch.nn.Linear(num_ftrs, 365)

            weights_url = "http://places2.csail.mit.edu/models_places365/resnet50_places365.pth.tar"
            weights_path = "app/checkpoints/resnet50_places365.pth.tar"  # เก็บใน folder checkpoints

            os.makedirs("app/checkpoints", exist_ok=True)

            if not os.path.exists(weights_path):
                print(f"   ⬇️ Downloading Places365 weights...")
                try:
                    urllib.request.urlretrieve(weights_url, weights_path)
                except Exception as e:
                    print(f"   ❌ Download failed: {e}")
                    return None, None

            checkpoint = torch.load(weights_path, map_location=self.device)
            state_dict = {str.replace(k, 'module.', ''): v for k, v in checkpoint['state_dict'].items()}
            self.scene_model.load_state_dict(state_dict)

            self.scene_model.to(self.device)
            self.scene_model.eval()

            self._load_scene_labels()
            print("   ✅ Scene Model Loaded (Manual Mode)!")
        except Exception as e:
            print(f"   ❌ Failed to load Scene Model: {e}")
            return None, None

        return self.scene_model, self.scene_labels

    def get_scene_transform(self):
        return transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def _load_scene_labels(self):
        label_file = "app/checkpoints/categories_places365.txt"

        os.makedirs("app/checkpoints", exist_ok=True)

        if not os.path.exists(label_file):
            url = "https://raw.githubusercontent.com/csailvision/places365/master/categories_places365.txt"
            try:
                urllib.request.urlretrieve(url, label_file)
            except Exception as e:
                print(f"❌ Failed to download scene labels: {e}")
                return

        classes = list()
        try:
            with open(label_file) as class_file:
                for line in class_file:
                    # Format: /a/airfield 0 -> airfield
                    classes.append(line.strip().split(' ')[0][3:])
            self.scene_labels = classes
        except Exception as e:
            print(f"❌ Failed to parse scene labels: {e}")


model_loader = ModelManager()