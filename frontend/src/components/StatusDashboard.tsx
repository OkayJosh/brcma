import React from "react";

type Props = {
  result: any;
  R: string[];
  C: string[];
};

export const StatusDashboard: React.FC<Props> = ({ result, R, C }) => {
  const unique = (indices: number[] = []) => Array.from(new Set(indices)).filter((idx) => idx >= 0);

  // Get categorized requirements
  const srIndices = unique(result.SR);
  const wrIndices = unique(result.WR);
  const rrIndices = unique(result.RR);
  const mrIndices = unique(result.MR);

  // Get requirement status for each requirement
  const getReqStatus = (i: number): "strong" | "weak" | "revisit" => {
    if (srIndices.includes(i)) return "strong";
    if (wrIndices.includes(i)) return "weak";
    return "revisit";
  };

  // Get criterion status
  const getCriterionStatus = (j: number): "covered" | "missing" => {
    return mrIndices.includes(j) ? "missing" : "covered";
  };

  // Calculate statistics
  const totalReqs = R.length;
  const totalCriteria = C.length;
  const strongCount = srIndices.length;
  const weakCount = wrIndices.length;
  const revisitCount = rrIndices.length;
  const missingCount = mrIndices.length;
  const coveredCount = totalCriteria - missingCount;

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(0)}%`;
  };

  return (
    <div className="stack">
      {/* Critical Issues Alert */}
      {(missingCount > 0 || revisitCount > 0) && (
        <div className="alert-card">
          <h3>⚠️ Attention Required</h3>
          {missingCount > 0 && (
            <div className="alert-item">
              <strong>{missingCount} missing criteria</strong> need requirements to address them
            </div>
          )}
          {revisitCount > 0 && (
            <div className="alert-item">
              <strong>{revisitCount} requirements</strong> need to be revisited (low strength)
            </div>
          )}
        </div>
      )}

      {/* Overall Status Grid */}
      <div className="metric-grid">
        <div className="metric-tile status-strong">
          <h4>Strong Requirements</h4>
          <span>{strongCount}</span>
          <div className="small-mono">{formatPercent(strongCount, totalReqs)} of total</div>
        </div>
        <div className="metric-tile status-weak">
          <h4>Weak Requirements</h4>
          <span>{weakCount}</span>
          <div className="small-mono">{formatPercent(weakCount, totalReqs)} of total</div>
        </div>
        <div className="metric-tile status-revisit">
          <h4>Needs Revisit</h4>
          <span>{revisitCount}</span>
          <div className="small-mono">{formatPercent(revisitCount, totalReqs)} of total</div>
        </div>
        <div className="metric-tile status-missing">
          <h4>Missing Criteria</h4>
          <span>{missingCount}</span>
          <div className="small-mono">{formatPercent(missingCount, totalCriteria)} of criteria</div>
        </div>
      </div>

      {/* Requirements Status Visual */}
      <div className="status-section">
        <h3>Requirements Status</h3>
        <div className="status-grid">
          {R.map((req, i) => {
            const status = getReqStatus(i);
            const strength = result.RS_norm?.[i] ?? 0;
            return (
              <div key={i} className={`status-card status-${status}`}>
                <div className="status-header">
                  <span className="status-badge">{req}</span>
                  <span className="status-value">{(strength * 100).toFixed(0)}%</span>
                </div>
                <div className="status-label">
                  {status === "strong" && "✓ Strong"}
                  {status === "weak" && "⚡ Weak"}
                  {status === "revisit" && "⚠ Revisit"}
                </div>
                <div className="status-bar">
                  <div
                    className="status-bar-fill"
                    style={{ width: `${strength * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Criteria Status Visual */}
      <div className="status-section">
        <h3>Criteria Coverage</h3>
        <div className="status-grid">
          {C.map((crit, j) => {
            const status = getCriterionStatus(j);
            const coverage = result.CC_norm?.[j] ?? 0;
            return (
              <div key={j} className={`status-card ${status === "missing" ? "status-missing" : "status-covered"}`}>
                <div className="status-header">
                  <span className="status-badge">{crit}</span>
                  <span className="status-value">{(coverage * 100).toFixed(0)}%</span>
                </div>
                <div className="status-label">
                  {status === "covered" ? "✓ Covered" : "✗ Missing"}
                </div>
                <div className="status-bar">
                  <div
                    className="status-bar-fill"
                    style={{ width: `${coverage * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Recommendations */}
      <div className="subtle-card stack">
        <h3>Key Recommendations</h3>
        {missingCount > 0 && (
          <div className="recommendation-item">
            <strong>Missing Criteria:</strong>
            <div className="badge-row">
              {mrIndices.map((j) => (
                <span key={j} className="tag tag-warning">
                  {C[j] ?? `C${j + 1}`}
                </span>
              ))}
            </div>
            <p className="section-description">
              These criteria lack sufficient requirement coverage. Consider adding new requirements or
              strengthening existing ones to address these areas.
            </p>
          </div>
        )}
        {revisitCount > 0 && (
          <div className="recommendation-item">
            <strong>Requirements to Revisit:</strong>
            <div className="badge-row">
              {rrIndices.map((i) => (
                <span key={i} className="tag tag-danger">
                  {R[i] ?? `R${i + 1}`}
                </span>
              ))}
            </div>
            <p className="section-description">
              These requirements have low strength scores. Review their criteria mappings and weights.
            </p>
          </div>
        )}
        {strongCount > 0 && (
          <div className="recommendation-item">
            <strong>Strong Requirements (Keep):</strong>
            <div className="badge-row">
              {srIndices.map((i) => (
                <span key={i} className="tag tag-success">
                  {R[i] ?? `R${i + 1}`}
                </span>
              ))}
            </div>
            <p className="section-description">
              These requirements are well-supported by the criteria and should be maintained.
            </p>
          </div>
        )}
      </div>

      {/* Weight Summary */}
      <div className="subtle-card stack">
        <h3>Weight Distribution</h3>
        <div className="weight-summary">
          <div className="weight-section">
            <h4>Requirement Weights (WRC)</h4>
            <div className="weight-items">
              {R.map((req, i) => {
                const weight = result.RS?.[i] ?? 0;
                const status = getReqStatus(i);
                return (
                  <div key={i} className="weight-item">
                    <span className={`weight-name status-${status}`}>{req}</span>
                    <span className="weight-value">{weight.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="weight-section">
            <h4>Criterion Weights (WEC)</h4>
            <div className="weight-items">
              {C.map((crit, j) => {
                const weight = result.CC?.[j] ?? 0;
                const status = getCriterionStatus(j);
                return (
                  <div key={j} className="weight-item">
                    <span className={`weight-name ${status === "missing" ? "status-missing" : ""}`}>{crit}</span>
                    <span className="weight-value">{weight.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
