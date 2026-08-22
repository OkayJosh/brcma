"""EIDF API Router — enhanced endpoint alongside original BRCMA."""

from fastapi import APIRouter
from app.core.eidf_schemas import EidfInput, EidfResult
from app.core.eidf_service import run_eidf

router = APIRouter()

@router.post("/run", response_model=EidfResult)
def run(input_data: EidfInput) -> EidfResult:
    """Run the full EIDF Design-Time Assessment Algorithm."""
    return run_eidf(input_data)
