import React from "react";

type DesignOption = {
  name: string;
  description: string;
  requirements: string[];
  criteria: string[];
};

type Result = {
  verdict: "Acceptable" | "Not Acceptable";
  domain_context: {
    domain: string;
    critical_criteria: string[];
    general_criteria: string[];
  };
  justification: string;
  design_quality_summary?: {
    strengths: string[];
    weaknesses: string[];
    improvement_suggestions: string[];
  };
  design_options: DesignOption[];
};

type Props = {
  result: Result;
};

export const DomainEvaluationResults: React.FC<Props> = ({ result }) => {
  const verdictClass = result.verdict === "Acceptable" ? "verdict-acceptable" : "verdict-reject";

  return (
    <div className="evaluation-results stack">
      <div className={`verdict-card ${verdictClass}`}>
        <div>
          <span className="field-label">Design Verdict</span>
          <h3>{result.verdict}</h3>
        </div>
        <div className="verdict-pill">{result.domain_context.domain}</div>
      </div>

      <div className="subtle-card stack">
        <span className="field-label">Domain Context</span>
        <div className="pill-row">
          {result.domain_context.critical_criteria.map((name) => (
            <span key={`critical-${name}`} className="pill pill-critical">
              {name}
            </span>
          ))}
          {result.domain_context.general_criteria.map((name) => (
            <span key={`general-${name}`} className="pill pill-general">
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="subtle-card stack">
        <span className="field-label">Justification</span>
        <p className="section-description">{result.justification}</p>
      </div>

      {result.design_quality_summary && (
        <div className="stack">
          <h3>Design Quality Summary</h3>
          <div className="form-grid">
            <div className="subtle-card stack">
              <span className="field-label">Strengths</span>
              {result.design_quality_summary.strengths.length ? (
                <div className="list-stack">
                  {result.design_quality_summary.strengths.map((item, idx) => (
                    <div key={`strength-${idx}`} className="list-item">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="small-mono">No strengths captured.</div>
              )}
            </div>
            <div className="subtle-card stack">
              <span className="field-label">Weaknesses</span>
              {result.design_quality_summary.weaknesses.length ? (
                <div className="list-stack">
                  {result.design_quality_summary.weaknesses.map((item, idx) => (
                    <div key={`weak-${idx}`} className="list-item">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="small-mono">No weaknesses captured.</div>
              )}
            </div>
            <div className="subtle-card stack">
              <span className="field-label">Improvements</span>
              {result.design_quality_summary.improvement_suggestions.length ? (
                <div className="list-stack">
                  {result.design_quality_summary.improvement_suggestions.map((item, idx) => (
                    <div key={`improve-${idx}`} className="list-item">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="small-mono">No improvements needed.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="stack">
        <h3>Design Options</h3>
        {result.design_options.length ? (
          <div className="list-reset">
            {result.design_options.map((option) => (
              <div key={option.name} className="design-option">
                <div>
                  <b>{option.name}</b>
                  <p className="section-description description-spacer">{option.description}</p>
                </div>
                <div>
                  <span className="field-label">Requirements</span>
                  <div className="badge-row">
                    {option.requirements.length ? (
                      option.requirements.map((name) => (
                        <span key={`${option.name}-req-${name}`} className="tag">
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="small-mono">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="field-label">Criteria</span>
                  <div className="badge-row">
                    {option.criteria.length ? (
                      option.criteria.map((name) => (
                        <span key={`${option.name}-crit-${name}`} className="tag">
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="small-mono">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No design options returned.</div>
        )}
      </div>
    </div>
  );
};
