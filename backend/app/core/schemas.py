from typing import List, Optional
from pydantic import BaseModel, Field

class BrcmaInput(BaseModel):
    R: List[str] = Field(..., description="Requirements r1..rn")
    C: List[str] = Field(..., description="Criteria c1..cm")
    WRC: List[float] = Field(..., description="Weights per requirement")
    WEC: List[float] = Field(..., description="Weights per criterion")
    # S is n x m matrix, S[i][j] in [0,1]
    S: List[List[float]] = Field(..., description="Matching matrix S(r_i, c_j) ∈ [0,1]")

    # Optional thresholds override
    thr_sr: float = 0.75
    thr_wr: float = 0.30
    thr_mr: float = 0.30

class DesignOption(BaseModel):
    name: str
    description: str
    requirements: List[int]  # indices into R
    criteria: List[int]      # indices into C

class BrcmaResult(BaseModel):
    RS: List[float]
    CC: List[float]
    RS_norm: List[float]
    CC_norm: List[float]
    SR: List[int]
    WR: List[int]
    RR: List[int]
    MR: List[int]
    design_options: List[DesignOption]
