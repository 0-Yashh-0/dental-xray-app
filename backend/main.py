from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import pydicom
from PIL import Image
import numpy as np
import uuid
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import HTTPException
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
ROBOFLOW_API_URL = os.getenv("ROBOFLOW_API_URL")
genai.configure(api_key=GEMINI_API_KEY)
class ReportRequest(BaseModel):
    image_id: str
    annotations: list

class PredictRequest(BaseModel):
    image_id: str

app = FastAPI()

#frontend access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://dobbe-ai.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-dicom/")
async def upload_dicom(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    dicom_path = os.path.join(UPLOAD_DIR, f"{file_id}.dcm")
    with open(dicom_path, "wb") as f:
        f.write(await file.read())

    ds = pydicom.dcmread(dicom_path)
    arr = ds.pixel_array

    arr = (arr - arr.min()) / (arr.max() - arr.min()) * 255
    arr = arr.astype(np.uint8)
    img = Image.fromarray(arr)
    png_path = os.path.join(UPLOAD_DIR, f"{file_id}.png")
    img.save(png_path)

    return {"image_id": file_id}

@app.get("/get-image/{image_id}")
def get_image(image_id: str):
    png_path = os.path.join(UPLOAD_DIR, f"{image_id}.png")
    if not os.path.exists(png_path):
        return JSONResponse(status_code=404, content={"error": "Image not found"})
    return FileResponse(png_path, media_type="image/png")

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

@app.post("/generate-report/")
def generate_report(request: ReportRequest):
    annotations = request.annotations
    if not annotations:
        return {"report": "No pathologies detected in the image."}

    prompt = (
        "Suppose you are a dental radiologist. Based on the image annotations provided below "
        "(which include detected pathologies), write a brief and concise diagnostic report in clinical language. "
        "Output a brief paragraph highlighting: Detected pathologies, location in mouth if possible(e.g, left upper molar), "
        "and clinical advice in points.\n\n"
        f"Annotations: {annotations}"
    )

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        report = response.text.strip()
    except Exception as e:
        print("Gemini API error:", e)
        raise HTTPException(status_code=500, detail=f"Gemini API error: {e}")


    return {"report": report}