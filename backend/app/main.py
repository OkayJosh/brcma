from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import brcma, eidf

app = FastAPI(title="BRCMA + EIDF API", version="0.2.0",
              description="Bi-Directional Requirement-Criterion Matching Algorithm "
                          "with Evaluation-Integrated Design Framework enhancements")

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.2.0", "eidf_enabled": True}

# Original BRCMA endpoint (backward compatible)
app.include_router(brcma.router, prefix="/api", tags=["BRCMA (Original)"])

# Enhanced EIDF endpoint
app.include_router(eidf.router, prefix="/eidf", tags=["EIDF (Enhanced)"])
