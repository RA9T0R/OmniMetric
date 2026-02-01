import time


class AIEngine:
    def __init__(self):
        self.model_loaded = False
        self.depth_model = None
        self.yolo_model = None

    def load_models(self):
        """โหลด Model เข้า GPU ตอนเริ่ม Server"""
        print("⏳ [AI Service] Loading Depth Anything V2 & YOLO...")
        # TODO: ใส่ code โหลด model จริงๆ ตรงนี้
        # self.depth_model = pipeline(...)
        # self.yolo_model = YOLO(...)
        time.sleep(1)  # จำลองการโหลด
        self.model_loaded = True
        print("✅ [AI Service] Models Ready!")

    def predict(self, image_bytes):
        """รับภาพ -> คืนค่า Depth Map & Objects"""
        if not self.model_loaded:
            raise RuntimeError("AI Models not loaded yet!")

        # TODO: ใส่ Logic ประมวลผลภาพจริงที่นี่
        print("🤖 Processing image with AI...")
        return {"status": "mock_result", "objects": [], "depth_map": "url..."}


# สร้าง Instance เดียวไว้ใช้ทั่วแอป (Singleton)
ai_manager = AIEngine()