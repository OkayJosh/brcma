from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import brcma

app = FastAPI(title="BRCMA API", version="0.1.0")

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
    return {"status": "ok"}

app.include_router(brcma.router, prefix="/brcma", tags=["BRCMA"])
