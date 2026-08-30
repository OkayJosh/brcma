from app.core.schemas import (
    DesignEvaluationInput,
    DomainProfile,
    DomainCriterion,
    DesignRepresentation,
    RequirementInput,
    CriterionSupport,
)
from app.core.evaluation import evaluate_design


def _base_input(completeness: float):
    profile = DomainProfile(
        domain="Fintech",
        criteria=[
            DomainCriterion(id="sec", name="Security", priority="critical"),
            DomainCriterion(id="audit", name="Auditability", priority="general"),
        ],
    )
    design = DesignRepresentation(components=[], data_flows=[])
    reqs = [
        RequirementInput(
            id="r1",
            name="Encrypt data at rest",
            completeness=completeness,
            components=["Storage"],
            data_flows=["Service->Storage"],
            criterion_support=[
                CriterionSupport(criterion_id="sec", similarity=0.9),
                CriterionSupport(criterion_id="audit", similarity=0.4),
            ],
        )
    ]
    return DesignEvaluationInput(domain_profile=profile, design=design, requirements=reqs)


def test_evaluation_accepts_when_critical_complete():
    data = _base_input(completeness=1.0)
    out = evaluate_design(data)
    assert out.verdict == "Acceptable"


def test_evaluation_rejects_when_critical_incomplete():
    data = _base_input(completeness=0.8)
    out = evaluate_design(data)
    assert out.verdict == "Not Acceptable"
