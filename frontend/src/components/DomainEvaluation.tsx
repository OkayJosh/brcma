import { useMemo, useState } from "react";
import { runEidf } from "../lib/api";
import { DomainEvaluationResults } from "./DomainEvaluationResults";

type DomainCriterion = {
  id: string;
  name: string;
  priority: "critical" | "general";
  description?: string;
};

type Component = {
  name: string;
  type: string;
  role: string;
  ownership?: string;
  trust_level?: string;
  responsibilities: string[];
  data_handled: string[];
  criticality?: string;
  assumptions: string[];
};

type DataFlow = {
  source: string;
  target: string;
  data_type: string;
  purpose: string;
  security_controls: string[];
  compliance_relevance: string[];
  impact?: string;
};

type CriterionSupport = {
  criterion_id: string;
  similarity: number;
  evidence?: string;
};

type RequirementInput = {
  id: string;
  name: string;
  completeness: number;
  components: string[];
  data_flows: string[];
  criterion_support: CriterionSupport[];
};

type DesignEvaluationInput = {
  domain_profile: {
    domain: string;
    criteria: DomainCriterion[];
  };
  design: {
    components: Component[];
    data_flows: DataFlow[];
  };
  requirements: RequirementInput[];
  weight_config?: {
    critical_criterion_weight: number;
    general_criterion_weight: number;
    critical_requirement_boost: number;
  };
  thr_sr: number;
  thr_wr: number;
  thr_mr: number;
  require_critical_completeness: boolean;
};

const demo: DesignEvaluationInput = {
  domain_profile: {
    domain: "Fintech",
    criteria: [
      { id: "sec", name: "Security", priority: "critical" },
      { id: "conf", name: "Confidentiality", priority: "critical" },
      { id: "audit", name: "Auditability", priority: "general" },
    ],
  },
  design: {
    components: [
      {
        name: "API Gateway",
        type: "Edge",
        role: "Ingress control",
        ownership: "Platform",
        trust_level: "Trusted",
        responsibilities: ["Authentication", "Rate limiting"],
        data_handled: ["PII", "Session tokens"],
        criticality: "High",
        assumptions: ["WAF enabled"],
      },
      {
        name: "Ledger Store",
        type: "Database",
        role: "Authoritative ledger",
        ownership: "Data",
        trust_level: "Restricted",
        responsibilities: ["Balance storage", "Audit trails"],
        data_handled: ["Account data", "Transaction logs"],
        criticality: "High",
        assumptions: ["Encrypted disks"],
      },
    ],
    data_flows: [
      {
        source: "API Gateway",
        target: "Ledger Store",
        data_type: "Transaction request",
        purpose: "Persist ledger updates",
        security_controls: ["mTLS", "Token auth"],
        compliance_relevance: ["PCI-DSS"],
        impact: "High",
      },
    ],
  },
  requirements: [
    {
      id: "r1",
      name: "Encrypt sensitive data at rest",
      completeness: 1.0,
      components: ["Ledger Store"],
      data_flows: ["API Gateway -> Ledger Store"],
      criterion_support: [
        { criterion_id: "sec", similarity: 0.9, evidence: "Disk encryption + KMS" },
        { criterion_id: "conf", similarity: 0.8, evidence: "Field-level encryption" },
      ],
    },
    {
      id: "r2",
      name: "Provide audit trails for critical actions",
      completeness: 0.9,
      components: ["Ledger Store"],
      data_flows: ["API Gateway -> Ledger Store"],
      criterion_support: [
        { criterion_id: "audit", similarity: 0.85, evidence: "Immutable event log" },
        { criterion_id: "sec", similarity: 0.5, evidence: "Integrity hashes" },
      ],
    },
  ],
  weight_config: {
    critical_criterion_weight: 1.0,
    general_criterion_weight: 0.6,
    critical_requirement_boost: 1.2,
  },
  thr_sr: 0.75,
  thr_wr: 0.3,
  thr_mr: 0.3,
  require_critical_completeness: true,
};

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const listToString = (items: string[]) => items.join(", ");

export function DomainEvaluation() {
  const [input, setInput] = useState<DesignEvaluationInput>(demo);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const criteriaOptions = useMemo(() => input.domain_profile.criteria, [input.domain_profile.criteria]);

  const updateCriteria = (idx: number, patch: Partial<DomainCriterion>) => {
    const criteria = input.domain_profile.criteria.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setInput({ ...input, domain_profile: { ...input.domain_profile, criteria } });
  };

  const addCriterion = () => {
    const nextId = `c${input.domain_profile.criteria.length + 1}`;
    const criteria = [
      ...input.domain_profile.criteria,
      { id: nextId, name: `Criterion ${nextId}`, priority: "general" as const },
    ];
    setInput({ ...input, domain_profile: { ...input.domain_profile, criteria } });
  };

  const removeCriterion = (idx: number) => {
    const criteria = input.domain_profile.criteria.filter((_, i) => i !== idx);
    setInput({ ...input, domain_profile: { ...input.domain_profile, criteria } });
  };

  const updateRequirement = (idx: number, patch: Partial<RequirementInput>) => {
    const requirements = input.requirements.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setInput({ ...input, requirements });
  };

  const addRequirement = () => {
    const nextId = `r${input.requirements.length + 1}`;
    const requirements = [
      ...input.requirements,
      {
        id: nextId,
        name: `Requirement ${nextId}`,
        completeness: 0.8,
        components: [],
        data_flows: [],
        criterion_support: criteriaOptions.length
          ? [{ criterion_id: criteriaOptions[0].id, similarity: 0.5 }]
          : [],
      },
    ];
    setInput({ ...input, requirements });
  };

  const removeRequirement = (idx: number) => {
    const requirements = input.requirements.filter((_, i) => i !== idx);
    setInput({ ...input, requirements });
  };

  const updateRequirementSupport = (reqIdx: number, supportIdx: number, patch: Partial<CriterionSupport>) => {
    const requirement = input.requirements[reqIdx];
    const criterion_support = requirement.criterion_support.map((s, i) => (i === supportIdx ? { ...s, ...patch } : s));
    updateRequirement(reqIdx, { criterion_support });
  };

  const addRequirementSupport = (reqIdx: number) => {
    const requirement = input.requirements[reqIdx];
    const criterion_support = [
      ...requirement.criterion_support,
      {
        criterion_id: criteriaOptions[0]?.id ?? "",
        similarity: 0.5,
      },
    ];
    updateRequirement(reqIdx, { criterion_support });
  };

  const removeRequirementSupport = (reqIdx: number, supportIdx: number) => {
    const requirement = input.requirements[reqIdx];
    const criterion_support = requirement.criterion_support.filter((_, i) => i !== supportIdx);
    updateRequirement(reqIdx, { criterion_support });
  };

  const updateComponent = (idx: number, patch: Partial<Component>) => {
    const components = input.design.components.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setInput({ ...input, design: { ...input.design, components } });
  };

  const addComponent = () => {
    const components = [
      ...input.design.components,
      {
        name: `Component ${input.design.components.length + 1}`,
        type: "",
        role: "",
        ownership: "",
        trust_level: "",
        responsibilities: [],
        data_handled: [],
        criticality: "",
        assumptions: [],
      },
    ];
    setInput({ ...input, design: { ...input.design, components } });
  };

  const removeComponent = (idx: number) => {
    const components = input.design.components.filter((_, i) => i !== idx);
    setInput({ ...input, design: { ...input.design, components } });
  };

  const updateFlow = (idx: number, patch: Partial<DataFlow>) => {
    const data_flows = input.design.data_flows.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    setInput({ ...input, design: { ...input.design, data_flows } });
  };

  const addFlow = () => {
    const data_flows = [
      ...input.design.data_flows,
      {
        source: "",
        target: "",
        data_type: "",
        purpose: "",
        security_controls: [],
        compliance_relevance: [],
        impact: "",
      },
    ];
    setInput({ ...input, design: { ...input.design, data_flows } });
  };

  const removeFlow = (idx: number) => {
    const data_flows = input.design.data_flows.filter((_, i) => i !== idx);
    setInput({ ...input, design: { ...input.design, data_flows } });
  };

  const runEvaluation = async () => {
    if (input.domain_profile.criteria.length === 0) {
      setError("Add at least one domain criterion before running the evaluation.");
      return;
    }
    const missingMappings = input.requirements.filter((req) => req.criterion_support.length === 0);
    if (missingMappings.length) {
      setError("Each requirement must map to at least one criterion.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await runEidf(input);
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="card">
        <div className="stack">
          <h2 className="section-title">Domain Evaluation Input</h2>
          <p className="section-description">
            Define the domain profile, map requirements to criteria, and describe the design. Requirement weights are
            generated from completeness and critical coverage before matching.
          </p>
        </div>

        <div className="subtle-card stack">
          <span className="field-label">Domain</span>
          <input
            className="input"
            value={input.domain_profile.domain}
            onChange={(e) => setInput({ ...input, domain_profile: { ...input.domain_profile, domain: e.target.value } })}
            placeholder="e.g., Fintech"
          />
        </div>

        <div className="stack">
          <div className="card-row">
            <div>
              <h3>Domain Criteria</h3>
              <p className="section-description">Prioritize critical obligations first, then add general criteria.</p>
            </div>
            <button className="button button-secondary" onClick={addCriterion} type="button">
              + Criterion
            </button>
          </div>
          <div className="stack">
            {input.domain_profile.criteria.map((criterion, idx) => (
              <div key={criterion.id} className="subtle-card form-grid">
                <label className="inline-field">
                  <span className="field-label">ID</span>
                  <input
                    className="input"
                    value={criterion.id}
                    onChange={(e) => updateCriteria(idx, { id: e.target.value })}
                  />
                </label>
                <label className="inline-field">
                  <span className="field-label">Name</span>
                  <input
                    className="input"
                    value={criterion.name}
                    onChange={(e) => updateCriteria(idx, { name: e.target.value })}
                  />
                </label>
                <label className="inline-field">
                  <span className="field-label">Priority</span>
                  <select
                    className="input"
                    value={criterion.priority}
                    onChange={(e) =>
                      updateCriteria(idx, { priority: e.target.value as DomainCriterion["priority"] })
                    }
                  >
                    <option value="critical">Critical</option>
                    <option value="general">General</option>
                  </select>
                </label>
                <label className="inline-field">
                  <span className="field-label">Description</span>
                  <input
                    className="input"
                    value={criterion.description ?? ""}
                    onChange={(e) => updateCriteria(idx, { description: e.target.value })}
                    placeholder="Optional context"
                  />
                </label>
                <button
                  className="button button-secondary"
                  onClick={() => removeCriterion(idx)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="card-row">
            <div>
              <h3>Requirements</h3>
              <p className="section-description">
                Provide completeness scores (0–1) and map each requirement to domain criteria.
              </p>
            </div>
            <button className="button button-secondary" onClick={addRequirement} type="button">
              + Requirement
            </button>
          </div>
          <div className="stack">
            {input.requirements.map((req, idx) => (
              <div key={req.id} className="subtle-card stack">
                <div className="form-grid">
                  <label className="inline-field">
                    <span className="field-label">ID</span>
                    <input
                      className="input"
                      value={req.id}
                      onChange={(e) => updateRequirement(idx, { id: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Name</span>
                    <input
                      className="input"
                      value={req.name}
                      onChange={(e) => updateRequirement(idx, { name: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Completeness</span>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={req.completeness}
                      onChange={(e) =>
                        updateRequirement(idx, { completeness: Number(e.target.value) || 0 })
                      }
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Components</span>
                    <input
                      className="input"
                      value={listToString(req.components)}
                      onChange={(e) => updateRequirement(idx, { components: parseList(e.target.value) })}
                      placeholder="Comma-separated"
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Data Flows</span>
                    <input
                      className="input"
                      value={listToString(req.data_flows)}
                      onChange={(e) => updateRequirement(idx, { data_flows: parseList(e.target.value) })}
                      placeholder="Comma-separated"
                    />
                  </label>
                </div>

                <div className="stack">
                  <div className="card-row">
                    <strong>Criterion Support</strong>
                    <button
                      className="button button-secondary"
                      onClick={() => addRequirementSupport(idx)}
                      type="button"
                      disabled={!criteriaOptions.length}
                    >
                      + Mapping
                    </button>
                  </div>
                  {req.criterion_support.length === 0 ? (
                    <div className="empty-state">Add at least one criterion mapping.</div>
                  ) : (
                    req.criterion_support.map((support, sIdx) => (
                      <div key={`${req.id}-${sIdx}`} className="form-grid">
                        <label className="inline-field">
                          <span className="field-label">Criterion</span>
                          <select
                            className="input"
                            value={support.criterion_id}
                            onChange={(e) =>
                              updateRequirementSupport(idx, sIdx, { criterion_id: e.target.value })
                            }
                          >
                            {criteriaOptions.length ? (
                              criteriaOptions.map((criterion) => (
                                <option key={criterion.id} value={criterion.id}>
                                  {criterion.name}
                                </option>
                              ))
                            ) : (
                              <option value="">Add criteria first</option>
                            )}
                          </select>
                        </label>
                        <label className="inline-field">
                          <span className="field-label">Similarity</span>
                          <input
                            className="input"
                            type="number"
                            min={0}
                            max={1}
                            step={0.05}
                            value={support.similarity}
                            onChange={(e) =>
                              updateRequirementSupport(idx, sIdx, {
                                similarity: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </label>
                        <label className="inline-field">
                          <span className="field-label">Evidence</span>
                          <input
                            className="input"
                            value={support.evidence ?? ""}
                            onChange={(e) =>
                              updateRequirementSupport(idx, sIdx, { evidence: e.target.value })
                            }
                          />
                        </label>
                        <button
                          className="button button-secondary"
                          onClick={() => removeRequirementSupport(idx, sIdx)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button className="button button-secondary" onClick={() => removeRequirement(idx)} type="button">
                  Remove Requirement
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="card-row">
            <div>
              <h3>Design Components</h3>
              <p className="section-description">Describe the core components and the data they handle.</p>
            </div>
            <button className="button button-secondary" onClick={addComponent} type="button">
              + Component
            </button>
          </div>
          {input.design.components.length === 0 ? (
            <div className="empty-state">No components added yet.</div>
          ) : (
            input.design.components.map((component, idx) => (
              <div key={`${component.name}-${idx}`} className="subtle-card stack">
                <div className="form-grid">
                  <label className="inline-field">
                    <span className="field-label">Name</span>
                    <input
                      className="input"
                      value={component.name}
                      onChange={(e) => updateComponent(idx, { name: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Type</span>
                    <input
                      className="input"
                      value={component.type}
                      onChange={(e) => updateComponent(idx, { type: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Role</span>
                    <input
                      className="input"
                      value={component.role}
                      onChange={(e) => updateComponent(idx, { role: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Ownership</span>
                    <input
                      className="input"
                      value={component.ownership ?? ""}
                      onChange={(e) => updateComponent(idx, { ownership: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Trust Level</span>
                    <input
                      className="input"
                      value={component.trust_level ?? ""}
                      onChange={(e) => updateComponent(idx, { trust_level: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Criticality</span>
                    <input
                      className="input"
                      value={component.criticality ?? ""}
                      onChange={(e) => updateComponent(idx, { criticality: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Responsibilities</span>
                    <input
                      className="input"
                      value={listToString(component.responsibilities)}
                      onChange={(e) =>
                        updateComponent(idx, { responsibilities: parseList(e.target.value) })
                      }
                      placeholder="Comma-separated"
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Data Handled</span>
                    <input
                      className="input"
                      value={listToString(component.data_handled)}
                      onChange={(e) =>
                        updateComponent(idx, { data_handled: parseList(e.target.value) })
                      }
                      placeholder="Comma-separated"
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Assumptions</span>
                    <input
                      className="input"
                      value={listToString(component.assumptions)}
                      onChange={(e) => updateComponent(idx, { assumptions: parseList(e.target.value) })}
                      placeholder="Comma-separated"
                    />
                  </label>
                </div>
                <button className="button button-secondary" onClick={() => removeComponent(idx)} type="button">
                  Remove Component
                </button>
              </div>
            ))
          )}
        </div>

        <div className="stack">
          <div className="card-row">
            <div>
              <h3>Data Flows</h3>
              <p className="section-description">Capture how data moves between components.</p>
            </div>
            <button className="button button-secondary" onClick={addFlow} type="button">
              + Data Flow
            </button>
          </div>
          {input.design.data_flows.length === 0 ? (
            <div className="empty-state">No data flows added yet.</div>
          ) : (
            input.design.data_flows.map((flow, idx) => (
              <div key={`${flow.source}-${flow.target}-${idx}`} className="subtle-card stack">
                <div className="form-grid">
                  <label className="inline-field">
                    <span className="field-label">Source</span>
                    <input
                      className="input"
                      value={flow.source}
                      onChange={(e) => updateFlow(idx, { source: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Target</span>
                    <input
                      className="input"
                      value={flow.target}
                      onChange={(e) => updateFlow(idx, { target: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Data Type</span>
                    <input
                      className="input"
                      value={flow.data_type}
                      onChange={(e) => updateFlow(idx, { data_type: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Purpose</span>
                    <input
                      className="input"
                      value={flow.purpose}
                      onChange={(e) => updateFlow(idx, { purpose: e.target.value })}
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Security Controls</span>
                    <input
                      className="input"
                      value={listToString(flow.security_controls)}
                      onChange={(e) =>
                        updateFlow(idx, { security_controls: parseList(e.target.value) })
                      }
                      placeholder="Comma-separated"
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Compliance</span>
                    <input
                      className="input"
                      value={listToString(flow.compliance_relevance)}
                      onChange={(e) =>
                        updateFlow(idx, { compliance_relevance: parseList(e.target.value) })
                      }
                      placeholder="Comma-separated"
                    />
                  </label>
                  <label className="inline-field">
                    <span className="field-label">Impact</span>
                    <input
                      className="input"
                      value={flow.impact ?? ""}
                      onChange={(e) => updateFlow(idx, { impact: e.target.value })}
                    />
                  </label>
                </div>
                <button className="button button-secondary" onClick={() => removeFlow(idx)} type="button">
                  Remove Data Flow
                </button>
              </div>
            ))
          )}
        </div>

        <div className="stack">
          <h3>Evaluation Settings</h3>
          <div className="form-grid">
            <label className="inline-field">
              <span className="field-label">Critical Criterion Weight</span>
              <input
                className="input"
                type="number"
                step={0.05}
                value={input.weight_config?.critical_criterion_weight ?? 1.0}
                onChange={(e) =>
                  setInput({
                    ...input,
                    weight_config: {
                      critical_criterion_weight: Number(e.target.value) || 1.0,
                      general_criterion_weight: input.weight_config?.general_criterion_weight ?? 0.6,
                      critical_requirement_boost: input.weight_config?.critical_requirement_boost ?? 1.2,
                    },
                  })
                }
              />
            </label>
            <label className="inline-field">
              <span className="field-label">General Criterion Weight</span>
              <input
                className="input"
                type="number"
                step={0.05}
                value={input.weight_config?.general_criterion_weight ?? 0.6}
                onChange={(e) =>
                  setInput({
                    ...input,
                    weight_config: {
                      critical_criterion_weight: input.weight_config?.critical_criterion_weight ?? 1.0,
                      general_criterion_weight: Number(e.target.value) || 0.6,
                      critical_requirement_boost: input.weight_config?.critical_requirement_boost ?? 1.2,
                    },
                  })
                }
              />
            </label>
            <label className="inline-field">
              <span className="field-label">Critical Requirement Boost</span>
              <input
                className="input"
                type="number"
                step={0.05}
                value={input.weight_config?.critical_requirement_boost ?? 1.2}
                onChange={(e) =>
                  setInput({
                    ...input,
                    weight_config: {
                      critical_criterion_weight: input.weight_config?.critical_criterion_weight ?? 1.0,
                      general_criterion_weight: input.weight_config?.general_criterion_weight ?? 0.6,
                      critical_requirement_boost: Number(e.target.value) || 1.2,
                    },
                  })
                }
              />
            </label>
            <label className="inline-field">
              <span className="field-label">Strong Threshold</span>
              <input
                className="input"
                type="number"
                step={0.05}
                value={input.thr_sr}
                onChange={(e) => setInput({ ...input, thr_sr: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="inline-field">
              <span className="field-label">Weak Threshold</span>
              <input
                className="input"
                type="number"
                step={0.05}
                value={input.thr_wr}
                onChange={(e) => setInput({ ...input, thr_wr: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="inline-field">
              <span className="field-label">Missing Threshold</span>
              <input
                className="input"
                type="number"
                step={0.05}
                value={input.thr_mr}
                onChange={(e) => setInput({ ...input, thr_mr: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="inline-field">
              <span className="field-label">Critical Completeness Required</span>
              <select
                className="input"
                value={input.require_critical_completeness ? "yes" : "no"}
                onChange={(e) =>
                  setInput({ ...input, require_critical_completeness: e.target.value === "yes" })
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>
        </div>

        <div className="button-row">
          <button className="button" onClick={runEvaluation} disabled={loading}>
            {loading ? "Evaluating..." : "Run Evaluation"}
          </button>
          <button className="button button-secondary" onClick={() => setInput(demo)} type="button">
            Reset Example
          </button>
          {error && <span className="inline-error">{error}</span>}
        </div>
        <p className="table-note">
          Requirement weights are generated from completeness (0.1–1.0) and boosted when supporting critical
          criteria. Inputs are assessed against domain obligations before a verdict is produced.
        </p>
      </section>

      <section className="card">
        <div className="stack">
          <h2 className="section-title">Evaluation Result</h2>
          <p className="section-description">
            The verdict is domain-gated and non-discretionary when critical criteria are missing.
          </p>
        </div>
        {result ? (
          <DomainEvaluationResults result={result} />
        ) : (
          <div className="empty-state">Run an evaluation to see the domain verdict and guidance.</div>
        )}
      </section>
    </>
  );
}
