from fastapi import APIRouter
from app.core.schemas import DesignEvaluationInput, DesignEvaluationResult
from app.core.evaluation import evaluate_design

router = APIRouter()


@router.post("/evaluate", response_model=DesignEvaluationResult)
def evaluate(input_data: DesignEvaluationInput) -> DesignEvaluationResult:
    return evaluate_design(input_data)
