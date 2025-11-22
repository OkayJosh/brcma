from fastapi import APIRouter
from app.core.schemas import BrcmaInput, BrcmaResult
from app.core.service import run_brcma

router = APIRouter()

@router.post("/run", response_model=BrcmaResult)
def run(input_data: BrcmaInput) -> BrcmaResult:
    return run_brcma(input_data)
