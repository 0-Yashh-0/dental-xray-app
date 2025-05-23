from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import pydicom
from PIL import Image
import numpy as np
import os
import uuid
from pydantic import BaseModel
import requests

class PredictRequest(BaseModel):
    image_id: str

app = FastAPI()

# Allow frontend (React) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-dicom/")
async def upload_dicom(file: UploadFile = File(...)):
    # Save uploaded DICOM file
    file_id = str(uuid.uuid4())
    dicom_path = os.path.join(UPLOAD_DIR, f"{file_id}.dcm")
    with open(dicom_path, "wb") as f:
        f.write(await file.read())

    # Read and convert DICOM to PNG
    ds = pydicom.dcmread(dicom_path)
    arr = ds.pixel_array
    # Normalize and convert to uint8
    arr = (arr - arr.min()) / (arr.max() - arr.min()) * 255
    arr = arr.astype(np.uint8)
    img = Image.fromarray(arr)
    png_path = os.path.join(UPLOAD_DIR, f"{file_id}.png")
    img.save(png_path)

    # Return PNG path (for testing, in prod use a proper static file server)
    return {"image_id": file_id}

@app.get("/get-image/{image_id}")
def get_image(image_id: str):
    png_path = os.path.join(UPLOAD_DIR, f"{image_id}.png")
    if not os.path.exists(png_path):
        return JSONResponse(status_code=404, content={"error": "Image not found"})
    return FileResponse(png_path, media_type="image/png")

ROBOFLOW_API_URL = "https://detect.roboflow.com/adr/6"  # Replace with your model endpoint
ROBOFLOW_API_KEY = "xxhcBh2OPo7IA5EEqqqn"    # Replace with your Roboflow API key

@app.post("/predict/")
def predict(request: PredictRequest):
    image_id = request.image_id
    png_path = os.path.join(UPLOAD_DIR, f"{image_id}.png")
    if not os.path.exists(png_path):
        return {"error": "Image not found"}

    with open(png_path, "rb") as f:
        img_bytes = f.read()

    response = requests.post(
        f"{ROBOFLOW_API_URL}?api_key={ROBOFLOW_API_KEY}",
        files={"file": img_bytes},
    )
    if response.status_code != 200:
        return {"error": "Roboflow API error", "details": response.text}

    return response.json()
