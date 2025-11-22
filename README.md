# BRCMA Full‑Stack Starter (FastAPI + Vite/React/TS)

This project implements the **Bi‑Directional Requirement–Criterion Matching Algorithm (BRCMA)**.

## Structureh
```
brcma-starter/
  backend/   # FastAPI service (POST /brcma/run)
  frontend/  # Vite + React + TypeScript UI
```

## Quickstart
### 1) Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend
```bash
cd ../frontend
npm install
npm run dev
# open http://localhost:5173
```

## API
- `GET /health` – health check
- `POST /brcma/run` – run BRCMA on the submitted matrix & weights
