# BRCMA Backend (FastAPI)

## Setup
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints
- `GET /health` – health check
- `POST /brcma/run` – run the algorithm

### POST /brcma/run
**Request body**
```json
{
  "R": ["r1","r2"],
  "C": ["c1","c2","c3"],
  "WRC": [1,1],
  "WEC": [0.4,0.3,0.3],
  "S": [[0.9,0.8,0.1],[0.2,0.3,0.5]]
}
```

**Response**
```json
{
  "RS": [ ... ],
  "CC": [ ... ],
  "RS_norm": [ ... ],
  "CC_norm": [ ... ],
  "SR": [ ... ],
  "WR": [ ... ],
  "RR": [ ... ],
  "MR": [ ... ],
  "design_options": [ ... ]
}
```
