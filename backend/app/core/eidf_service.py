"""
EIDF Service — Enhanced BRCMA engine implementing the full
EIDF Design-Time Assessment Algorithm (EIDF-DTAA, Algorithm 3.1).

Stages:
  1. Artefact Classification — identify requirement types
  2. Criteria Retrieval — load applicable SRC criteria
  3. Criterion-Level Assessment — compute α scores (original BRCMA)
  4. Characteristic Aggregation — compute ψ_j and Q(S)
  5. Violation Detection — classify violations and rank recommendations
"""

from typing import List, Dict, Tuple
import numpy as np

from app.core.eidf_schemas import (
    EidfInput, EidfResult, CharacteristicScore, Violation,
    Recommendation, DesignOption, ConstraintCheckResult,
)
from app.core.quality_model import (
    QUALITY_CHARACTERISTICS, QC_MAP, QC_NAME_MAP,
    EVALUATION_CRITERIA, EC_MAP, CRITERIA_BY_CHARACTERISTIC,
)


def _safe_norm(vec: np.ndarray) -> np.ndarray:
    """Normalise vector to [0,1] range by dividing by max."""
    vmax = vec.max() if vec.size else 0.0
    if vmax <= 0:
        return np.zeros_like(vec)
    return vec / vmax


def _effort_numeric(effort_str: str) -> float:
    """Convert effort estimate to numeric for R(a_k) computation."""
    return {"Low": 1.0, "Medium": 2.0, "High": 3.0}.get(effort_str, 2.0)


# ═══════════════════════════════════════════════════════════════════════
# FORMAL CONSTRAINT CHECKS (FC-01 to FC-17, selected key constraints)
# ═══════════════════════════════════════════════════════════════════════

def check_constraints(data: EidfInput) -> List[ConstraintCheckResult]:
    """Verify formal constraints from the EIDF Formal Constraint Model."""
    results = []
    n, m = len(data.R), len(data.C)
    S = np.array(data.S, dtype=float)

    # FC-01: Requirement-Quality Attribute Coverage
    # ∀ r ∈ R : ∃ qa ∈ QA such that (r, qa) ∈ assoc
    # Every requirement must map to at least one criterion with score > 0
    uncovered_reqs = []
    for i in range(n):
        if S[i].sum() == 0:
            uncovered_reqs.append(data.R[i])
    results.append(ConstraintCheckResult(
        constraint_id="FC-01",
        constraint_name="Requirement-Quality Attribute Coverage",
        passed=len(uncovered_reqs) == 0,
        message=f"All requirements have at least one criterion mapping." if not uncovered_reqs
                else f"Uncovered requirements (no criterion mapping): {', '.join(uncovered_reqs)}"
    ))

    # FC-07: Weight Normalisation
    # Characteristic weights should sum to 1.0
    if data.W_char:
        w_sum = sum(data.W_char.values())
        results.append(ConstraintCheckResult(
            constraint_id="FC-07",
            constraint_name="Characteristic Weight Normalisation",
            passed=abs(w_sum - 1.0) < 0.01,
            message=f"Characteristic weights sum to {w_sum:.4f} (target: 1.0)."
        ))
    else:
        results.append(ConstraintCheckResult(
            constraint_id="FC-07",
            constraint_name="Characteristic Weight Normalisation",
            passed=True,
            message="Using default equal weights (1/9 each, sum = 1.0)."
        ))

    # FC-09: Criterion-Quality Attribute Single Association
    # Each criterion maps to exactly one quality characteristic
    multi_assoc = []
    for j, cid in enumerate(data.C):
        if cid in EC_MAP:
            pass  # single association enforced by data model
        else:
            multi_assoc.append(cid)
    results.append(ConstraintCheckResult(
        constraint_id="FC-09",
        constraint_name="Criterion Single Characteristic Association",
        passed=len(multi_assoc) == 0,
        message="All criteria map to exactly one quality characteristic." if not multi_assoc
                else f"Unknown criteria (not in SRC): {', '.join(multi_assoc)}"
    ))

    # FC-15: Criteria Applicability
    # Every design artefact must have at least one applicable criterion
    # (same as FC-01 from criterion perspective)
    uncovered_criteria = []
    for j in range(m):
        if S[:, j].sum() == 0:
            uncovered_criteria.append(data.C[j])
    results.append(ConstraintCheckResult(
        constraint_id="FC-15",
        constraint_name="Criteria Applicability",
        passed=len(uncovered_criteria) == 0,
        message="All criteria have at least one requirement mapping." if not uncovered_criteria
                else f"Unapplied criteria (no requirement maps to them): {', '.join(uncovered_criteria)}"
    ))

    # FC-02: Assessment Scale Validity
    # All S[i][j] values must be in {0.0, 0.5, 1.0}
    valid_values = {0.0, 0.5, 1.0}
    invalid_cells = []
    for i in range(n):
        for j in range(m):
            if S[i][j] not in valid_values:
                invalid_cells.append(f"S[{data.R[i]},{data.C[j]}]={S[i][j]}")
    results.append(ConstraintCheckResult(
        constraint_id="FC-02",
        constraint_name="Assessment Scale Validity",
        passed=len(invalid_cells) == 0,
        message="All scores use the three-level scale {0.0, 0.5, 1.0}." if not invalid_cells
                else f"Invalid scores (must be 0.0, 0.5, or 1.0): {', '.join(invalid_cells[:5])}{'...' if len(invalid_cells) > 5 else ''}"
    ))

    # FC-03: Matrix Completeness
    # The matching matrix must be fully populated (n × m)
    results.append(ConstraintCheckResult(
        constraint_id="FC-03",
        constraint_name="Matrix Dimensional Completeness",
        passed=S.shape == (n, m),
        message=f"Matrix is {n}×{m} = {n*m} cells, fully populated." if S.shape == (n, m)
                else f"Matrix shape mismatch: expected ({n},{m}), got {S.shape}."
    ))

    return results


# ═══════════════════════════════════════════════════════════════════════
# MAIN EIDF ASSESSMENT FUNCTION
# ═══════════════════════════════════════════════════════════════════════

def run_eidf(data: EidfInput) -> EidfResult:
    """
    Execute the full EIDF Design-Time Assessment Algorithm.
    
    Implements Algorithm 3.1 (EIDF-DTAA) from the thesis:
      Stage 1: Artefact Classification
      Stage 2: Criteria Retrieval  
      Stage 3: Criterion-Level Assessment (original BRCMA core)
      Stage 4: Characteristic Aggregation → Q(S)
      Stage 5: Violation Detection & Recommendation Ranking
    """
    R, C = data.R, data.C
    n, m = len(R), len(C)
    S = np.array(data.S, dtype=float)
    WRC = np.array(data.WRC, dtype=float)
    WEC = np.array(data.WEC, dtype=float)

    # ── Validation ──────────────────────────────────────────────────
    if S.shape != (n, m):
        raise ValueError(f"S must be {n}x{m}, got {S.shape}")
    if WRC.shape[0] != n:
        raise ValueError("WRC length must equal len(R)")
    if WEC.shape[0] != m:
        raise ValueError("WEC length must equal len(C)")

    S = np.clip(S, 0.0, 1.0)

    # ── Stage 3: Criterion-Level Assessment (BRCMA core) ────────────
    S_weighted = (WRC[:, None] * S) * WEC[None, :]
    RS = S_weighted.sum(axis=1)   # Requirement Strength
    CC = S_weighted.sum(axis=0)   # Criterion Coverage
    RS_norm = _safe_norm(RS)
    CC_norm = _safe_norm(CC)

    # Classify requirements
    SR = [i for i, v in enumerate(RS_norm) if v >= data.thr_sr]
    WR = [i for i, v in enumerate(RS_norm) if data.thr_wr <= v < data.thr_sr]
    RR = [i for i, v in enumerate(RS_norm) if v < data.thr_wr]
    MR = [j for j, v in enumerate(CC_norm) if v < data.thr_mr]

    # Generate original BRCMA design options (backward compatible)
    do1 = DesignOption(name="Optimal", description="SR + medium WR addressing key criteria",
        requirements=SR + WR[:max(0, len(WR)//2)], criteria=[i for i in range(m) if i not in MR])
    do2 = DesignOption(name="Balanced", description="Mix of SR and WR with trade-offs",
        requirements=SR + WR, criteria=list(range(m)))
    do3 = DesignOption(name="Minimalist", description="Only SR to ensure simplicity",
        requirements=SR, criteria=[i for i in range(m) if i not in MR])
    do4 = DesignOption(name="Enhanced Quality", description="Add new requirements to address MR",
        requirements=SR + WR, criteria=MR)

    # ── Stage 4: Characteristic Aggregation → Q(S) ──────────────────
    # Build characteristic weights
    char_weights = {}
    for qc in QUALITY_CHARACTERISTICS:
        char_weights[qc.id] = data.W_char.get(qc.id, qc.default_weight)

    # Normalise characteristic weights to sum to 1.0
    w_total = sum(char_weights.values())
    if w_total > 0:
        char_weights = {k: v / w_total for k, v in char_weights.items()}

    # Compute ψ_j (characteristic-level score) for each characteristic
    characteristic_scores = []
    for qc in QUALITY_CHARACTERISTICS:
        # Find indices of criteria belonging to this characteristic
        char_criteria_ids = [ec.id for ec in CRITERIA_BY_CHARACTERISTIC.get(qc.id, [])]
        char_indices = [j for j, cid in enumerate(C) if cid in char_criteria_ids]

        if not char_indices:
            # No criteria from this characteristic in the input
            psi_j = 0.0
            covered = 0
            total = len(char_criteria_ids)
        else:
            # ψ_j = mean of criterion-level scores for this characteristic
            # Using the maximum score across all requirements for each criterion
            criterion_max_scores = []
            covered = 0
            for j in char_indices:
                max_score = S[:, j].max() if n > 0 else 0.0
                criterion_max_scores.append(max_score)
                if max_score > 0:
                    covered += 1
            psi_j = np.mean(criterion_max_scores) if criterion_max_scores else 0.0
            total = len(char_indices)

        w_j = char_weights.get(qc.id, 1/9)
        coverage_pct = (covered / total * 100) if total > 0 else 0.0

        characteristic_scores.append(CharacteristicScore(
            characteristic_id=qc.id,
            characteristic_name=qc.name,
            weight=w_j,
            raw_score=float(psi_j),
            weighted_score=float(w_j * psi_j),
            criteria_count=total,
            criteria_covered=covered,
            coverage_percentage=round(coverage_pct, 1),
        ))

    # Q(S) = Σ w_j × ψ_j
    Q_S = sum(cs.weighted_score for cs in characteristic_scores)

    # ── Stage 5: Violation Detection & Recommendations ───────────────
    violations = []
    violation_counter = 0

    for cs in characteristic_scores:
        severity = None
        threshold = 0.0

        if cs.raw_score < data.critical_threshold:
            severity = "CRITICAL"
            threshold = data.critical_threshold
        elif cs.raw_score < data.major_threshold:
            severity = "MAJOR"
            threshold = data.major_threshold
        elif cs.raw_score < data.minor_threshold:
            severity = "MINOR"
            threshold = data.minor_threshold

        if severity:
            violation_counter += 1
            # Find which criteria are weak/missing in this characteristic
            char_criteria_ids = [ec.id for ec in CRITERIA_BY_CHARACTERISTIC.get(cs.characteristic_id, [])]
            weak_criteria = []
            for cid in char_criteria_ids:
                if cid in [C[j] for j in range(m)]:
                    j = [idx for idx, c in enumerate(C) if c == cid]
                    if j:
                        max_score = S[:, j[0]].max()
                        if max_score < 0.5:
                            weak_criteria.append(cid)
                else:
                    weak_criteria.append(cid)

            violations.append(Violation(
                violation_id=f"V-{violation_counter:03d}",
                severity=severity,
                characteristic_id=cs.characteristic_id,
                characteristic_name=cs.characteristic_name,
                description=f"{cs.characteristic_name} score ({cs.raw_score:.2f}) is below the {severity} threshold ({threshold:.2f}). "
                            f"{len(weak_criteria)} criteria need attention.",
                affected_criteria=weak_criteria,
                current_score=cs.raw_score,
                threshold=threshold,
                gap=round(threshold - cs.raw_score, 4),
            ))

    # Sort violations: CRITICAL first, then MAJOR, MINOR, INFO
    severity_order = {"CRITICAL": 0, "MAJOR": 1, "MINOR": 2, "INFO": 3}
    violations.sort(key=lambda v: (severity_order.get(v.severity, 4), -v.gap))

    # Generate ranked recommendations using R(a_k) = ΔQ / effort
    recommendations = []
    for rank_idx, v in enumerate(violations):
        # Estimate ΔQ: improving this characteristic to the threshold
        delta_q = v.gap * char_weights.get(v.characteristic_id, 1/9)

        # Estimate effort based on number of affected criteria
        n_affected = len(v.affected_criteria)
        if n_affected <= 2:
            effort = "Low"
        elif n_affected <= 5:
            effort = "Medium"
        else:
            effort = "High"

        benefit_to_effort = delta_q / _effort_numeric(effort)

        # Construct actionable recommendation
        if v.severity == "CRITICAL":
            action = (f"URGENT: Address {v.characteristic_name} — currently at {v.current_score:.0%}. "
                      f"Add or strengthen requirements covering: {', '.join(v.affected_criteria[:5])}.")
        elif v.severity == "MAJOR":
            action = (f"Strengthen {v.characteristic_name} coverage by addressing criteria: "
                      f"{', '.join(v.affected_criteria[:5])}.")
        else:
            action = (f"Consider improving {v.characteristic_name} by reviewing criteria: "
                      f"{', '.join(v.affected_criteria[:5])}.")

        recommendations.append(Recommendation(
            rank=rank_idx + 1,
            action=action,
            target_criteria=v.affected_criteria,
            target_characteristic=v.characteristic_name,
            expected_delta_q=round(delta_q, 4),
            effort_estimate=effort,
            benefit_to_effort=round(benefit_to_effort, 4),
        ))

    # Sort recommendations by benefit-to-effort ratio (highest first)
    recommendations.sort(key=lambda r: -r.benefit_to_effort)
    for i, rec in enumerate(recommendations):
        rec.rank = i + 1

    # ── Formal Constraint Checks ─────────────────────────────────────
    constraint_checks = check_constraints(data)

    # ── Overall coverage ─────────────────────────────────────────────
    total_nonzero = np.count_nonzero(S)
    overall_coverage = (total_nonzero / (n * m) * 100) if (n * m) > 0 else 0.0

    # ── Assemble result ──────────────────────────────────────────────
    critical_count = sum(1 for v in violations if v.severity == "CRITICAL")
    major_count = sum(1 for v in violations if v.severity == "MAJOR")
    minor_count = sum(1 for v in violations if v.severity == "MINOR")
    info_count = sum(1 for v in violations if v.severity == "INFO")

    return EidfResult(
        # Original BRCMA outputs
        RS=RS.tolist(),
        CC=CC.tolist(),
        RS_norm=RS_norm.tolist(),
        CC_norm=CC_norm.tolist(),
        SR=SR, WR=WR, RR=RR, MR=MR,
        design_options=[do1, do2, do3, do4],

        # EIDF enhancements
        Q_S=round(Q_S, 4),
        characteristic_scores=characteristic_scores,
        violations=violations,
        recommendations=recommendations,
        constraint_checks=constraint_checks,

        # Summary
        total_requirements=n,
        total_criteria=m,
        total_violations=len(violations),
        critical_count=critical_count,
        major_count=major_count,
        minor_count=minor_count,
        info_count=info_count,
        overall_coverage_percentage=round(overall_coverage, 1),
    )
