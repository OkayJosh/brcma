from typing import Dict, List, Optional
import numpy as np

from app.core.schemas import (
    DesignEvaluationInput,
    DesignEvaluationResult,
    DesignOptionSummary,
    DesignQualitySummary,
    DomainContext,
    RequirementInput,
    WeightConfig,
)


def _safe_norm(vec: np.ndarray) -> np.ndarray:
    vmax = vec.max() if vec.size else 0.0
    if vmax <= 0:
        return np.zeros_like(vec)
    return vec / vmax


def _format_req_context(req: RequirementInput) -> str:
    parts: List[str] = []
    if req.components:
        parts.append(f"components: {', '.join(req.components)}")
    if req.data_flows:
        parts.append(f"data flows: {', '.join(req.data_flows)}")
    if not parts:
        return ""
    return f" ({'; '.join(parts)})"


def evaluate_design(data: DesignEvaluationInput) -> DesignEvaluationResult:
    profile = data.domain_profile
    criteria = profile.criteria
    if not criteria:
        raise ValueError("Domain profile must include at least one criterion")
    if not data.requirements:
        raise ValueError("At least one requirement is required for evaluation")

    crit_index: Dict[str, int] = {c.id: i for i, c in enumerate(criteria)}
    if len(crit_index) != len(criteria):
        raise ValueError("Domain criteria ids must be unique")

    C_names = [c.name for c in criteria]
    critical_ids = {c.id for c in criteria if c.priority == "critical"}
    general_ids = {c.id for c in criteria if c.priority == "general"}

    reqs = data.requirements
    n, m = len(reqs), len(criteria)

    S = np.zeros((n, m), dtype=float)
    completeness = np.zeros(n, dtype=float)
    supports_critical = np.zeros(n, dtype=bool)
    best_req_for_criterion: Dict[str, Optional[int]] = {c.id: None for c in criteria}
    best_sim_for_criterion: Dict[str, float] = {c.id: 0.0 for c in criteria}
    best_completeness_for_criterion: Dict[str, float] = {c.id: 0.0 for c in criteria}

    for i, req in enumerate(reqs):
        completeness[i] = req.completeness
        for support in req.criterion_support:
            if support.criterion_id not in crit_index:
                raise ValueError(f"Unknown criterion_id: {support.criterion_id}")
            j = crit_index[support.criterion_id]
            S[i, j] = max(S[i, j], support.similarity)
            if support.similarity > best_sim_for_criterion[support.criterion_id]:
                best_sim_for_criterion[support.criterion_id] = support.similarity
                best_req_for_criterion[support.criterion_id] = i
            if req.completeness > best_completeness_for_criterion[support.criterion_id]:
                best_completeness_for_criterion[support.criterion_id] = req.completeness
            if support.criterion_id in critical_ids and support.similarity > 0:
                supports_critical[i] = True

    cfg = data.weight_config or WeightConfig()
    WEC = np.array(
        [
            cfg.critical_criterion_weight if c.id in critical_ids else cfg.general_criterion_weight
            for c in criteria
        ],
        dtype=float,
    )

    # Requirement weights generated from completeness, boosted if they support critical criteria.
    WRC = []
    for i in range(n):
        base = 0.1 + 0.9 * float(completeness[i])
        if supports_critical[i]:
            base *= cfg.critical_requirement_boost
        WRC.append(min(1.0, base))
    WRC = np.array(WRC, dtype=float)

    # Apply weights before matching.
    S_weighted = (WRC[:, None] * S) * WEC[None, :]

    RS = S_weighted.sum(axis=1)
    CC = S_weighted.sum(axis=0)

    RS_norm = _safe_norm(RS)
    CC_norm = _safe_norm(CC)

    thr_sr = data.thr_sr
    thr_wr = data.thr_wr
    thr_mr = data.thr_mr

    SR = [i for i, v in enumerate(RS_norm.tolist()) if v >= thr_sr]
    WR = [i for i, v in enumerate(RS_norm.tolist()) if thr_wr <= v < thr_sr]
    RR = [i for i, v in enumerate(RS_norm.tolist()) if v < thr_wr]

    MR_base = {j for j, v in enumerate(CC_norm.tolist()) if v < thr_mr}

    MR_critical_incomplete = set()
    if data.require_critical_completeness:
        for c in criteria:
            if c.id in critical_ids and best_completeness_for_criterion[c.id] < 1.0:
                MR_critical_incomplete.add(crit_index[c.id])

    MR = sorted(MR_base.union(MR_critical_incomplete))

    missing_critical = [j for j in MR if criteria[j].id in critical_ids]
    verdict = "Not Acceptable" if missing_critical else "Acceptable"

    def _criteria_for_req(i: int) -> List[str]:
        row = S[i]
        if not np.any(row > 0):
            return []
        top_idx = np.argsort(row)[::-1][:2]
        return [C_names[j] for j in top_idx if row[j] > 0]

    def _req_name(i: int) -> str:
        return reqs[i].name if 0 <= i < len(reqs) else f"R{i + 1}"

    def _crit_name(j: int) -> str:
        return C_names[j] if 0 <= j < len(C_names) else f"C{j + 1}"

    # Design options derived from classifications.
    def _req_names(indices: List[int]) -> List[str]:
        return [_req_name(i) for i in indices]

    def _crit_names(indices: List[int]) -> List[str]:
        return [_crit_name(j) for j in indices]

    do1 = DesignOptionSummary(
        name="Optimal",
        description="Strong requirements plus selective weak requirements; excludes missing criteria.",
        requirements=_req_names(SR + WR[: max(0, len(WR) // 2)]),
        criteria=_crit_names([j for j in range(m) if j not in MR]),
    )
    do2 = DesignOptionSummary(
        name="Balanced",
        description="Strong and weak requirements across all criteria.",
        requirements=_req_names(SR + WR),
        criteria=_crit_names(list(range(m))),
    )
    do3 = DesignOptionSummary(
        name="Minimalist",
        description="Strong requirements only; focuses on covered criteria.",
        requirements=_req_names(SR),
        criteria=_crit_names([j for j in range(m) if j not in MR]),
    )
    do4 = DesignOptionSummary(
        name="Enhanced Quality",
        description="Adds coverage to missing criteria while keeping strong and weak requirements.",
        requirements=_req_names(SR + WR),
        criteria=_crit_names(MR),
    )

    critical_names = [c.name for c in criteria if c.id in critical_ids]
    general_names = [c.name for c in criteria if c.id in general_ids]
    domain_context = DomainContext(
        domain=profile.domain,
        critical_criteria=critical_names,
        general_criteria=general_names,
    )

    justification_lines: List[str] = []
    if verdict == "Not Acceptable":
        missing_names = [_crit_name(j) for j in missing_critical]
        justification_lines.append(
            f"Not acceptable for {profile.domain}: critical criteria not adequately satisfied ({', '.join(missing_names)})."
        )
        for j in missing_critical:
            c = criteria[j]
            best_req_idx = best_req_for_criterion[c.id]
            if best_req_idx is None or best_sim_for_criterion[c.id] <= 0:
                justification_lines.append(
                    f"No mapped requirement from the design supports '{c.name}'."
                )
            else:
                req = reqs[best_req_idx]
                context = _format_req_context(req)
                justification_lines.append(
                    f"'{c.name}' is weakly supported by requirement '{req.name}'{context}."
                )
    else:
        justification_lines.append(
            f"Acceptable for {profile.domain}: all critical criteria have adequate coverage in the design."
        )
        if MR:
            justification_lines.append(
                f"Some general criteria are still weakly covered ({', '.join(_crit_name(j) for j in MR)})."
            )
        if RR:
            justification_lines.append(
                f"{len(RR)} requirements should be revisited for strength and clarity."
            )

    strengths: List[str] = []
    for i in SR:
        criteria_list = _criteria_for_req(i)
        context = _format_req_context(reqs[i])
        if criteria_list:
            strengths.append(
                f"Strong requirement '{reqs[i].name}' supports {', '.join(criteria_list)}{context}."
            )
        else:
            strengths.append(f"Strong requirement '{reqs[i].name}' is well-formed{context}.")

    weaknesses: List[str] = []
    for j in MR:
        weaknesses.append(f"Criterion '{_crit_name(j)}' lacks adequate coverage.")
    for i in RR:
        weaknesses.append(f"Requirement '{reqs[i].name}' has low strength and needs revision.")

    improvements: List[str] = []
    for j in missing_critical:
        improvements.append(
            f"Add or strengthen requirements to fully address critical criterion '{_crit_name(j)}'."
        )
    for j in MR:
        if j not in missing_critical:
            improvements.append(
                f"Improve coverage for general criterion '{_crit_name(j)}' by adding supporting requirements."
            )
    for i in RR:
        improvements.append(f"Revisit requirement '{reqs[i].name}' to improve completeness or mapping.")

    design_quality_summary = DesignQualitySummary(
        strengths=strengths,
        weaknesses=weaknesses,
        improvement_suggestions=improvements,
    )

    return DesignEvaluationResult(
        verdict=verdict,
        domain_context=domain_context,
        justification=" ".join(justification_lines),
        design_quality_summary=design_quality_summary,
        design_options=[do1, do2, do3, do4],
    )
