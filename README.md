🦷 **Dental X-ray AI Dashboard**

A full-stack web application for uploading dental DICOM X-ray images, detecting pathologies using AI (Roboflow), and generating clinical diagnostic reports with Google Gemini LLM.
Built with FastAPI (Python backend), React + Vite + pnpm (frontend), and fully Dockerized for local development and cloud deployment (Render & Vercel).

🚀 **Features**

DICOM Upload: Upload dental X-ray images (.dcm/.rvg).

AI Pathology Detection: Uses Roboflow API to detect dental pathologies and draw bounding boxes.

LLM Diagnostic Report: Generates a clinical report using Google Gemini based on image annotations.

Simple UI: Two-panel dashboard—image viewer (with bounding boxes) and diagnostic report.

Dockerized: Easy local development and deployment.

Production Ready: Deployable to Render (backend) and Vercel (frontend).

🖥️ **Tech Stack**

Backend: FastAPI, pydicom, Pillow, requests, google-generativeai, python-dotenv

Frontend: React, Vite, pnpm, react-markdown

AI/ML: Roboflow (object detection), Google Gemini (LLM report)

DevOps: Docker, Docker Compose

Cloud: Render (backend), Vercel (frontend)

🏁 **Local Development** (with Docker)

1. Clone the Repository

bash
git clone https://github.com/yourusername/dental-xray-app.git
cd dental-xray-app

2. Set Environment Variables

Backend:
Create backend/.env :

text
GEMINI_API_KEY=your_gemini_api_key
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_API_URL=https://detect.roboflow.com/your-model/1

Frontend:
Create frontend/.env (not committed to git):

text
VITE_API_URL=http://localhost:8000

3. Start the App (Dev Mode)
bash
docker compose up --build

Frontend: http://localhost:5173

Backend: http://localhost:8000

🌐 **Production Deployment**

Backend (Render)
Push backend to GitHub.

Create a new Web Service on Render.

Set build command: pip install -r requirements.txt

Set start command: uvicorn main:app --host 0.0.0.0 --port $PORT

Add environment variables in Render dashboard.

Frontend (Vercel)
Push frontend to GitHub.

Import project on Vercel.

Set environment variable VITE_API_URL=https://your-backend-service.onrender.com

Deploy!
