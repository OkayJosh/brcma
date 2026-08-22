# EIDF-Enhanced BRCMA — Quick Start Guide

## What's New
The BRCMA has been enhanced with the Evaluation-Integrated Design Framework (EIDF):
- **9 ISO/IEC 25010:2023 quality characteristics** with 67 SRC evaluation criteria
- **Q(S) composite quality scoring** function
- **Violation detection** with severity classification (CRITICAL/MAJOR/MINOR/INFO)
- **Ranked recommendations** using R(aₖ) = ΔQ/effort benefit-to-effort ratio
- **Formal constraint verification** (FC-01, FC-02, FC-03, FC-07, FC-09, FC-15)

## How to Run

### Option A: Backend Only (quickest way to test)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Then open your browser to: **http://localhost:8000/docs**

You'll see TWO API groups:
- **BRCMA (Original)** → `POST /api/run` — the original algorithm
- **EIDF (Enhanced)** → `POST /eidf/run` — the new EIDF assessment

### Option B: Full Stack (backend + frontend)
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Option C: Docker
```bash
docker-compose --profile production up --build
```

## Testing the EIDF Endpoint

### Using the Swagger UI (easiest)
1. Go to http://localhost:8000/docs
2. Click on `POST /eidf/run`
3. Click "Try it out"
4. Paste the sample JSON below
5. Click "Execute"

### Sample JSON Input
```json
{
  "R": ["FR-PRR-01", "FR-PRR-02", "FR-PRR-03"],
  "R_descriptions": [
    "Register new patients with demographics",
    "Generate unique Hospital Number",
    "Maintain single longitudinal EHR"
  ],
  "C": ["EC-FS-01", "EC-FS-02", "EC-FS-05", "EC-US-01", "EC-SC-02", "EC-SF-07"],
  "C_characteristic": ["QC-01", "QC-01", "QC-01", "QC-04", "QC-06", "QC-09"],
  "WRC": [1.0, 1.0, 1.0],
  "WEC": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  "S": [
    [1.0, 0.5, 1.0, 0.5, 0.5, 0.5],
    [0.5, 1.0, 0.5, 0.0, 0.0, 1.0],
    [1.0, 0.5, 1.0, 0.5, 1.0, 0.0]
  ]
}
```

### What the Response Contains
- `Q_S` — The composite quality score (0 to 1)
- `characteristic_scores` — Score for each of the 9 quality characteristics
- `violations` — Quality violations with CRITICAL/MAJOR/MINOR/INFO severity
- `recommendations` — Ranked corrective actions with benefit-to-effort ratio
- `constraint_checks` — Formal constraint verification (PASS/FAIL)
- Plus all original BRCMA outputs (RS, CC, SR, WR, RR, MR, design_options)

## File Structure (New/Modified Files)
```
backend/app/core/
  quality_model.py    ✨ NEW — 9 characteristics + 67 SRC criteria
  eidf_schemas.py     ✨ NEW — Enhanced input/output data models
  eidf_service.py     ✨ NEW — EIDF-DTAA Algorithm 3.1 implementation
  schemas.py          (original — unchanged)
  service.py          (original — unchanged)

backend/app/routers/
  eidf.py             ✨ NEW — /eidf/run API endpoint
  brcma.py            (original — unchanged)

backend/app/
  main.py             ✏️ MODIFIED — Added EIDF router
```

## Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (now shows eidf_enabled: true) |
| `/api/run` | POST | Original BRCMA algorithm (backward compatible) |
| `/eidf/run` | POST | **NEW** EIDF enhanced assessment |
| `/docs` | GET | Interactive Swagger API documentation |

## Frontend Features (Updated)

### Engine Mode Selector
The UI now has a toggle at the top to switch between:
- **🔬 EIDF Enhanced** — Full ISO/IEC 25010:2023 assessment with Q(S) scoring
- **📊 BRCMA Original** — The original matching algorithm

### EIDF Results Dashboard
When using the EIDF mode, results include:
1. **Q(S) Hero Display** — Large composite quality score with progress bar
2. **Summary Metrics** — Requirements count, criteria count, coverage %, violation count
3. **Radar Chart** — 9-axis spider chart of ISO/IEC 25010:2023 characteristic scores
4. **Bar Chart** — Characteristic scores with criteria coverage counts
5. **Characteristic Detail Cards** — Individual score cards for each of the 9 characteristics
6. **Violations Panel** — Colour-coded by severity (CRITICAL red, MAJOR orange, MINOR yellow)
7. **Recommendations Panel** — Ranked by R(aₖ) benefit-to-effort ratio
8. **Constraint Verification** — PASS/FAIL status for each formal constraint
