# Use an official lightweight Python image.
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# --- FIX: Install System Dependencies for OpenCV (cv2) ---
# libgl1: Replacement for libgl1-mesa-glx in newer Debian versions
# libglib2.0-0: Fixes "libgthread-2.0.so.0" errors often seen with cv2
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (to cache dependencies)
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir keeps the image smaller
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]