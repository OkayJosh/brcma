"""
EIDF Quality Model — ISO/IEC 25010:2023 Quality Characteristics and
the 67-item Structured Requirements Catalogue (SRC).

This module provides the authoritative quality model data that grounds
the EIDF's design-time quality assessment in the international standard.
"""

from typing import Dict, List
from pydantic import BaseModel


class QualityCharacteristic(BaseModel):
    """One of the nine ISO/IEC 25010:2023 quality characteristics."""
    id: str                          # e.g. "QC-01"
    name: str                        # e.g. "Functional Suitability"
    sub_characteristics: List[str]   # e.g. ["Completeness", "Correctness", ...]
    default_weight: float            # default w_j for equal weighting = 1/9


class EvaluationCriterion(BaseModel):
    """One of the 67 SRC evaluation criteria."""
    id: str                          # e.g. "EC-FS-01"
    characteristic_id: str           # parent QC id, e.g. "QC-01"
    name: str                        # short name
    description: str                 # full criterion statement
    assessment_method: str           # MetricMeasurement | ModelChecking | PeerReview | FormalVerification
    priority: str                    # High | Medium | Low


# ═══════════════════════════════════════════════════════════════════════
# ISO/IEC 25010:2023 — Nine Quality Characteristics
# ═══════════════════════════════════════════════════════════════════════
QUALITY_CHARACTERISTICS: List[QualityCharacteristic] = [
    QualityCharacteristic(
        id="QC-01", name="Functional Suitability",
        sub_characteristics=["Functional Completeness", "Functional Correctness", "Functional Appropriateness"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-02", name="Performance Efficiency",
        sub_characteristics=["Time Behaviour", "Resource Utilisation", "Capacity"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-03", name="Compatibility",
        sub_characteristics=["Co-existence", "Interoperability"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-04", name="Usability",
        sub_characteristics=["Appropriateness Recognisability", "Learnability", "Operability",
                             "User Error Protection", "UI Aesthetics", "Accessibility"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-05", name="Reliability",
        sub_characteristics=["Maturity", "Availability", "Fault Tolerance", "Recoverability"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-06", name="Security",
        sub_characteristics=["Confidentiality", "Integrity", "Non-repudiation",
                             "Accountability", "Authenticity"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-07", name="Maintainability",
        sub_characteristics=["Modularity", "Reusability", "Analysability",
                             "Modifiability", "Testability"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-08", name="Portability",
        sub_characteristics=["Adaptability", "Installability", "Replaceability"],
        default_weight=1/9),
    QualityCharacteristic(
        id="QC-09", name="Safety",
        sub_characteristics=["Operational Constraint", "Risk Identification",
                             "Fail Safe", "Hazard Warning", "Safe Integration"],
        default_weight=1/9),
]

QC_MAP: Dict[str, QualityCharacteristic] = {qc.id: qc for qc in QUALITY_CHARACTERISTICS}
QC_NAME_MAP: Dict[str, str] = {qc.id: qc.name for qc in QUALITY_CHARACTERISTICS}


# ═══════════════════════════════════════════════════════════════════════
# 67-Item Structured Requirements Catalogue (SRC)
# Organised by ISO/IEC 25010:2023 Quality Characteristic
# ═══════════════════════════════════════════════════════════════════════
EVALUATION_CRITERIA: List[EvaluationCriterion] = [
    # ── QC-01: Functional Suitability (8 criteria) ──────────────────
    EvaluationCriterion(id="EC-FS-01", characteristic_id="QC-01", name="Functional Completeness",
        description="The design shall specify all functions required to satisfy the stated and implied needs of all identified stakeholders.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-FS-02", characteristic_id="QC-01", name="Functional Correctness",
        description="The design shall ensure that each specified function produces correct results with the required degree of precision.",
        assessment_method="FormalVerification", priority="High"),
    EvaluationCriterion(id="EC-FS-03", characteristic_id="QC-01", name="Functional Appropriateness",
        description="The design shall ensure that functions facilitate the accomplishment of specified tasks and objectives.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-FS-04", characteristic_id="QC-01", name="Use Case Coverage",
        description="The design shall trace every functional requirement to at least one use case and one design construct.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-FS-05", characteristic_id="QC-01", name="Data Integrity Rules",
        description="The design shall specify validation rules, referential integrity constraints, and business rules for all data entities.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-FS-06", characteristic_id="QC-01", name="Workflow Completeness",
        description="The design shall specify complete end-to-end workflows for all identified business processes.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-FS-07", characteristic_id="QC-01", name="Error Handling Specification",
        description="The design shall specify error handling behaviour for all anticipated error conditions.",
        assessment_method="ModelChecking", priority="Medium"),
    EvaluationCriterion(id="EC-FS-08", characteristic_id="QC-01", name="Standards Compliance",
        description="The design shall comply with relevant domain standards (e.g., ICD-10, HL7 FHIR, DICOM).",
        assessment_method="PeerReview", priority="High"),

    # ── QC-02: Performance Efficiency (7 criteria) ──────────────────
    EvaluationCriterion(id="EC-PE-01", characteristic_id="QC-02", name="Response Time Specification",
        description="The design shall specify maximum acceptable response times for all user-facing operations.",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-PE-02", characteristic_id="QC-02", name="Throughput Specification",
        description="The design shall specify minimum throughput for transaction-intensive operations.",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-PE-03", characteristic_id="QC-02", name="Concurrent User Capacity",
        description="The design shall specify and support the required number of concurrent users without degradation.",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-PE-04", characteristic_id="QC-02", name="Database Query Optimisation",
        description="The design shall specify indexing strategies and query optimisation for frequently accessed data.",
        assessment_method="MetricMeasurement", priority="Medium"),
    EvaluationCriterion(id="EC-PE-05", characteristic_id="QC-02", name="Resource Utilisation Bounds",
        description="The design shall specify CPU, memory, and storage resource utilisation limits.",
        assessment_method="MetricMeasurement", priority="Medium"),
    EvaluationCriterion(id="EC-PE-06", characteristic_id="QC-02", name="Caching Strategy",
        description="The design shall specify a caching strategy for frequently accessed and static data.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-PE-07", characteristic_id="QC-02", name="Scalability Architecture",
        description="The design shall specify how the system scales to accommodate growth in data volume and user load.",
        assessment_method="PeerReview", priority="High"),

    # ── QC-03: Compatibility (6 criteria) ───────────────────────────
    EvaluationCriterion(id="EC-CO-01", characteristic_id="QC-03", name="API Specification",
        description="The design shall specify RESTful API endpoints with OpenAPI documentation for all external interfaces.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-CO-02", characteristic_id="QC-03", name="Healthcare Interoperability",
        description="The design shall specify HL7 FHIR R4 compliant data exchange for clinical data.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-CO-03", characteristic_id="QC-03", name="External System Integration",
        description="The design shall specify integration interfaces for all identified external systems (NHIA, OHIS, HMO, SMS, email).",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-CO-04", characteristic_id="QC-03", name="Data Format Standards",
        description="The design shall specify standard data formats (JSON, CSV, DICOM, PDF) for all data exchange points.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-CO-05", characteristic_id="QC-03", name="Browser Compatibility",
        description="The design shall specify compatibility with current versions of Chrome, Firefox, and Edge.",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-CO-06", characteristic_id="QC-03", name="Device Responsiveness",
        description="The design shall specify responsive design supporting desktop, tablet, and mobile viewports.",
        assessment_method="PeerReview", priority="Medium"),

    # ── QC-04: Usability (8 criteria) ──────────────────────────────
    EvaluationCriterion(id="EC-US-01", characteristic_id="QC-04", name="Navigation Structure",
        description="The design shall specify a consistent, intuitive navigation structure with maximum 3-click depth to any function.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-US-02", characteristic_id="QC-04", name="Learnability",
        description="The design shall support task completion by a newly trained user within the specified training time.",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-US-03", characteristic_id="QC-04", name="Input Validation Feedback",
        description="The design shall specify immediate, inline validation feedback for all data entry fields.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-US-04", characteristic_id="QC-04", name="Error Recovery",
        description="The design shall provide clear error messages and recovery paths for all user-facing errors.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-US-05", characteristic_id="QC-04", name="Contextual Help",
        description="The design shall specify contextual help text for all data entry fields and complex workflows.",
        assessment_method="PeerReview", priority="Low"),
    EvaluationCriterion(id="EC-US-06", characteristic_id="QC-04", name="Accessibility",
        description="The design shall specify accessibility features compliant with WCAG 2.1 Level AA.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-US-07", characteristic_id="QC-04", name="Terminology Consistency",
        description="The design shall use consistent, domain-appropriate medical terminology throughout.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-US-08", characteristic_id="QC-04", name="Emergency Access Design",
        description="The design shall provide emergency/critical functions accessible within 2 clicks from any screen.",
        assessment_method="MetricMeasurement", priority="High"),

    # ── QC-05: Reliability (8 criteria) ─────────────────────────────
    EvaluationCriterion(id="EC-RE-01", characteristic_id="QC-05", name="Uptime Specification",
        description="The design shall specify a minimum uptime target (e.g., 99.5%) with defined measurement method.",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-RE-02", characteristic_id="QC-05", name="Fault Tolerance",
        description="The design shall specify fault tolerance mechanisms for all critical system components.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-RE-03", characteristic_id="QC-05", name="Data Backup and Recovery",
        description="The design shall specify automated backup frequency, retention policy, and recovery time objective.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-RE-04", characteristic_id="QC-05", name="Offline Mode Capability",
        description="The design shall specify offline operation capabilities for critical functions during connectivity loss.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-RE-05", characteristic_id="QC-05", name="Graceful Degradation",
        description="The design shall specify graceful degradation behaviour when dependent services are unavailable.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-RE-06", characteristic_id="QC-05", name="Data Consistency",
        description="The design shall specify mechanisms for maintaining data consistency across concurrent operations.",
        assessment_method="FormalVerification", priority="High"),
    EvaluationCriterion(id="EC-RE-07", characteristic_id="QC-05", name="Transaction Integrity",
        description="The design shall specify ACID transaction properties for all financial and clinical data operations.",
        assessment_method="FormalVerification", priority="High"),
    EvaluationCriterion(id="EC-RE-08", characteristic_id="QC-05", name="Alert and Notification Reliability",
        description="The design shall specify reliable delivery mechanisms for critical alerts (e.g., critical lab values).",
        assessment_method="ModelChecking", priority="High"),

    # ── QC-06: Security (8 criteria) ───────────────────────────────
    EvaluationCriterion(id="EC-SC-01", characteristic_id="QC-06", name="Authentication Mechanism",
        description="The design shall specify multi-factor authentication for privileged roles.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SC-02", characteristic_id="QC-06", name="Authorisation Model",
        description="The design shall specify Role-Based Access Control with least-privilege principle.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SC-03", characteristic_id="QC-06", name="Data Encryption",
        description="The design shall specify encryption for data in transit (TLS 1.2+) and at rest (AES-256).",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-SC-04", characteristic_id="QC-06", name="Audit Trail",
        description="The design shall specify an immutable audit trail for all data access and modification events.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SC-05", characteristic_id="QC-06", name="Session Management",
        description="The design shall specify session timeout, secure token handling, and session invalidation.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SC-06", characteristic_id="QC-06", name="Data Protection Compliance",
        description="The design shall specify compliance with applicable data protection regulations (NDPR 2019).",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-SC-07", characteristic_id="QC-06", name="Sensitive Data Handling",
        description="The design shall specify enhanced access controls for sensitive records (psychiatric, HIV, etc.).",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SC-08", characteristic_id="QC-06", name="Input Sanitisation",
        description="The design shall specify input validation and sanitisation to prevent injection attacks.",
        assessment_method="ModelChecking", priority="High"),

    # ── QC-07: Maintainability (8 criteria) ─────────────────────────
    EvaluationCriterion(id="EC-MA-01", characteristic_id="QC-07", name="Modular Architecture",
        description="The design shall specify a modular architecture with clearly defined component boundaries and interfaces.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-MA-02", characteristic_id="QC-07", name="Separation of Concerns",
        description="The design shall enforce separation of presentation, business logic, and data access layers.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-MA-03", characteristic_id="QC-07", name="Configuration Externalisation",
        description="The design shall externalise all configurable parameters (tariffs, drug lists, ICD codes) from code.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-MA-04", characteristic_id="QC-07", name="Code Documentation",
        description="The design shall specify API documentation standards (OpenAPI 3.0) and inline code documentation.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-MA-05", characteristic_id="QC-07", name="Version Control Strategy",
        description="The design shall specify a version control strategy with branching model and release management.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-MA-06", characteristic_id="QC-07", name="Testability",
        description="The design shall specify a testing strategy with target code coverage and test automation.",
        assessment_method="MetricMeasurement", priority="High"),
    EvaluationCriterion(id="EC-MA-07", characteristic_id="QC-07", name="Dependency Management",
        description="The design shall specify dependency management with pinned versions and vulnerability scanning.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-MA-08", characteristic_id="QC-07", name="Logging and Monitoring",
        description="The design shall specify application logging levels, log retention, and monitoring dashboards.",
        assessment_method="PeerReview", priority="Medium"),

    # ── QC-08: Portability (6 criteria) ─────────────────────────────
    EvaluationCriterion(id="EC-PO-01", characteristic_id="QC-08", name="Platform Independence",
        description="The design shall specify deployment on open-source infrastructure without proprietary OS dependencies.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-PO-02", characteristic_id="QC-08", name="Containerisation",
        description="The design shall specify containerised deployment (Docker) for environment reproducibility.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-PO-03", characteristic_id="QC-08", name="Database Abstraction",
        description="The design shall use an ORM or database abstraction layer to minimise database vendor lock-in.",
        assessment_method="ModelChecking", priority="Medium"),
    EvaluationCriterion(id="EC-PO-04", characteristic_id="QC-08", name="Configuration Portability",
        description="The design shall use environment variables for deployment-specific configuration.",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-PO-05", characteristic_id="QC-08", name="Data Export Capability",
        description="The design shall support data export in standard portable formats (CSV, JSON, PDF).",
        assessment_method="PeerReview", priority="Medium"),
    EvaluationCriterion(id="EC-PO-06", characteristic_id="QC-08", name="Migration Strategy",
        description="The design shall specify a database migration strategy supporting schema evolution.",
        assessment_method="PeerReview", priority="Medium"),

    # ── QC-09: Safety (8 criteria) ──────────────────────────────────
    EvaluationCriterion(id="EC-SF-01", characteristic_id="QC-09", name="Operational Constraints",
        description="The design shall specify operational constraints that prevent unsafe system states (e.g., drug overdose limits).",
        assessment_method="FormalVerification", priority="High"),
    EvaluationCriterion(id="EC-SF-02", characteristic_id="QC-09", name="Risk Identification",
        description="The design shall identify and document clinical safety risks associated with each design decision.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-SF-03", characteristic_id="QC-09", name="Fail-Safe Defaults",
        description="The design shall specify fail-safe default behaviour for all safety-critical functions.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SF-04", characteristic_id="QC-09", name="Hazard Warning System",
        description="The design shall specify automated alerts for clinically hazardous conditions (critical values, interactions).",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SF-05", characteristic_id="QC-09", name="Safe Integration",
        description="The design shall specify safe integration protocols when interfacing with medical devices and external systems.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-SF-06", characteristic_id="QC-09", name="Clinical Decision Safeguards",
        description="The design shall specify confirmation steps and override controls for safety-critical clinical decisions.",
        assessment_method="PeerReview", priority="High"),
    EvaluationCriterion(id="EC-SF-07", characteristic_id="QC-09", name="Patient Identification Safety",
        description="The design shall specify at least two patient identifiers for all clinical transactions to prevent misidentification.",
        assessment_method="ModelChecking", priority="High"),
    EvaluationCriterion(id="EC-SF-08", characteristic_id="QC-09", name="Data Loss Prevention",
        description="The design shall specify auto-save, session recovery, and data loss prevention for in-progress clinical documentation.",
        assessment_method="ModelChecking", priority="High"),
]

EC_MAP: Dict[str, EvaluationCriterion] = {ec.id: ec for ec in EVALUATION_CRITERIA}

# Criteria grouped by characteristic
CRITERIA_BY_CHARACTERISTIC: Dict[str, List[EvaluationCriterion]] = {}
for ec in EVALUATION_CRITERIA:
    if ec.characteristic_id not in CRITERIA_BY_CHARACTERISTIC:
        CRITERIA_BY_CHARACTERISTIC[ec.characteristic_id] = []
    CRITERIA_BY_CHARACTERISTIC[ec.characteristic_id].append(ec)

# Verification: total should be 67
assert len(EVALUATION_CRITERIA) == 67, f"Expected 67 criteria, got {len(EVALUATION_CRITERIA)}"
assert len(QUALITY_CHARACTERISTICS) == 9, f"Expected 9 characteristics, got {len(QUALITY_CHARACTERISTICS)}"
