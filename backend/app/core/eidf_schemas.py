"""
Enhanced EIDF Schemas — extends original BRCMA schemas with
ISO/IEC 25010:2023 quality characteristic structure, Q(S) composite
scoring, violation detection, and recommendation ranking.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════════════
# INPUT SCHEMAS
# ═══════════════════════════════════════════════════════════════════════

class EidfInput(BaseModel):
    """Enhanced input that extends BRCMA with quality characteristic grouping."""
    R: List[str] = Field(..., description="Requirement IDs (e.g. FR-PRR-01)")
    R_descriptions: List[str] = Field(default=[], description="Requirement descriptions (optional, for reporting)")
    C: List[str] = Field(..., description="Criterion IDs from SRC (e.g. EC-FS-01)")
    C_characteristic: List[str] = Field(..., description="Quality Characteristic ID for each criterion (e.g. QC-01)")
    WRC: List[float] = Field(..., description="Weights per requirement")
    WEC: List[float] = Field(..., description="Weights per criterion")
    W_char: Dict[str, float] = Field(default={}, description="Weights per characteristic (QC-01..QC-09). Defaults to 1/9 each.")
    S: List[List[float]] = Field(..., description="Matching matrix S[i][j] using 3-level scale {0.0, 0.5, 1.0}")
    evidence_tags: Optional[List[List[str]]] = Field(default=None,
        description="Evidence classification for each S[i][j]: ETA, SI, DI, or empty")

    # Thresholds
    thr_sr: float = 0.75
    thr_wr: float = 0.30
    thr_mr: float = 0.30

    # Violation severity thresholds
    critical_threshold: float = 0.10   # characteristic score below this = CRITICAL
    major_threshold: float = 0.30      # below this = MAJOR
    minor_threshold: float = 0.50      # below this = MINOR
    # above minor_threshold = INFO or OK


# ═══════════════════════════════════════════════════════════════════════
# OUTPUT SCHEMAS
# ═══════════════════════════════════════════════════════════════════════

class CharacteristicScore(BaseModel):
    """Quality score for a single ISO/IEC 25010:2023 characteristic."""
    characteristic_id: str
    characteristic_name: str
    weight: float
    raw_score: float         # ψ_j unweighted (0-1)
    weighted_score: float    # w_j × ψ_j
    criteria_count: int
    criteria_covered: int    # criteria with score > 0
    coverage_percentage: float


class Violation(BaseModel):
    """A quality violation detected during assessment."""
    violation_id: str
    severity: str            # CRITICAL | MAJOR | MINOR | INFO
    characteristic_id: str
    characteristic_name: str
    description: str
    affected_criteria: List[str]
    current_score: float
    threshold: float
    gap: float               # threshold - current_score


class Recommendation(BaseModel):
    """A ranked corrective recommendation."""
    rank: int
    action: str
    target_criteria: List[str]
    target_characteristic: str
    expected_delta_q: float   # ΔQ(a_k) — expected quality improvement
    effort_estimate: str      # Low | Medium | High
    benefit_to_effort: float  # R(a_k) = ΔQ / effort


class DesignOption(BaseModel):
    """Original BRCMA design option, preserved for backward compatibility."""
    name: str
    description: str
    requirements: List[int]
    criteria: List[int]


class ConstraintCheckResult(BaseModel):
    """Result of a formal constraint check."""
    constraint_id: str
    constraint_name: str
    passed: bool
    message: str


class EidfResult(BaseModel):
    """Complete EIDF assessment result."""
    # Original BRCMA outputs (backward compatible)
    RS: List[float]
    CC: List[float]
    RS_norm: List[float]
    CC_norm: List[float]
    SR: List[int]
    WR: List[int]
    RR: List[int]
    MR: List[int]
    design_options: List[DesignOption]

    # EIDF enhancements
    Q_S: float                                    # Composite quality score Q(S) = Σ w_j × ψ_j
    characteristic_scores: List[CharacteristicScore]  # 9 characteristic-level scores
    violations: List[Violation]                    # Detected violations with severity
    recommendations: List[Recommendation]          # Ranked corrective recommendations
    constraint_checks: List[ConstraintCheckResult] # Formal constraint verification results

    # Summary metrics
    total_requirements: int
    total_criteria: int
    total_violations: int
    critical_count: int
    major_count: int
    minor_count: int
    info_count: int
    overall_coverage_percentage: float
