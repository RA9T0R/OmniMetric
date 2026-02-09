# Use an official lightweight Python image.
FROM python:3.10-slim

# Install System Dependencies
RUN apt-get update && apt-get install -y \
    git \
    libgl1 \
    libglib2.0-0 \
    wget \
    pkg-config \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- FIX 1: Upgrade pip immediately (Critical for resolving modern wheels) ---
RUN pip install --upgrade pip

# --- FIX 2: Pre-install sentencepiece to avoid compilation errors ---
# ติดตั้งเวอร์ชันล่าสุดที่มี Wheel สำหรับ Python 3.10 จะได้ไม่ต้อง Compile
RUN pip install --no-cache-dir sentencepiece

# Copy requirements
COPY requirements.txt .

# --- FIX 3: Install dependencies ---
# แยก git install ออกมา หรือรันรวมก็ได้ แต่ pip ใหม่น่าจะเอาอยู่
RUN pip install --no-cache-dir -r requirements.txt

# Clone Depth Anything V2
RUN git clone https://github.com/DepthAnything/Depth-Anything-V2.git /libs/Depth-Anything-V2

COPY . .

ENV PYTHONPATH="${PYTHONPATH}:/libs/Depth-Anything-V2"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]