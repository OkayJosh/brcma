import React from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from "recharts";

type CharacteristicScore = {
  characteristic_id: string;
  characteristic_name: string;
  weight: number;
  raw_score: number;
  weighted_score: number;
  criteria_count: number;
  criteria_covered: number;
  coverage_percentage: number;
};

type Violation = {
  violation_id: string;
  severity: string;
  characteristic_id: string;
  characteristic_name: string;
  description: string;
  affected_criteria: string[];
  current_score: number;
  threshold: number;
  gap: number;
};

type Recommendation = {
  rank: number;
  action: string;
  target_criteria: string[];
  target_characteristic: string;
  expected_delta_q: number;
  effort_estimate: string;
  benefit_to_effort: number;
};

type ConstraintCheck = {
  constraint_id: string;
  constraint_name: string;
  passed: boolean;
  message: string;
};

type EidfResult = {
  Q_S: number;
  characteristic_scores: CharacteristicScore[];
  violations: Violation[];
  recommendations: Recommendation[];
  constraint_checks: ConstraintCheck[];
  RS: number[];
  CC: number[];
  RS_norm: number[];
  CC_norm: number[];
  SR: number[];
  WR: number[];
  RR: number[];
  MR: number[];
  total_requirements: number;
  total_criteria: number;
  total_violations: number;
  critical_count: number;
  major_count: number;
  minor_count: number;
  info_count: number;
  overall_coverage_percentage: number;
};

type Props = {
  result: EidfResult;
  R: string[];
  C: string[];
};

const severityColors: Record<string, string> = {
  CRITICAL: "#dc2626",
  MAJOR: "#ea580c",
  MINOR: "#eab308",
  INFO: "#3b82f6",
};

const effortColors: Record<string, string> = {
  Low: "#22c55e",
  Medium: "#eab308",
  High: "#ef4444",
};

const formatPct = (v: number) => `${(v * 100).toFixed(0)}%`;

export const EidfResultsView: React.FC<Props> = ({ result, R, C }) => {
  // Prepare radar chart data
  const radarData = result.characteristic_scores.map((cs) => ({
    characteristic: cs.characteristic_name.replace("Functional ", "Func. ").replace("Performance ", "Perf. "),
    score: Math.round(cs.raw_score * 100),
    fullName: cs.characteristic_name,
  }));

  // Prepare bar chart data for characteristic scores
  const barData = result.characteristic_scores.map((cs) => ({
    name: cs.characteristic_name.split(" ")[0],
    score: cs.raw_score,
    fullName: cs.characteristic_name,
    covered: cs.criteria_covered,
    total: cs.criteria_count,
  }));

  const charColors = [
    "#2563eb", "#0891b2", "#059669", "#d97706", "#7c3aed",
    "#dc2626", "#0d9488", "#6366f1", "#be123c"
  ];

  return (
    <div className="results-section">
      {/* ── Q(S) COMPOSITE SCORE ── */}
      <div className="qs-hero">
        <div className="qs-score-container">
          <div className="qs-label">Composite Quality Score</div>
          <div className="qs-value">Q(S) = {result.Q_S.toFixed(4)}</div>
          <div className="qs-bar-container">
            <div className="qs-bar" style={{ width: `${result.Q_S * 100}%` }} />
          </div>
          <div className="qs-sublabel">{formatPct(result.Q_S)} of maximum quality</div>
        </div>
      </div>

      {/* ── SUMMARY METRICS ── */}
      <div className="metric-grid">
        <div className="metric-tile">
          <h4>Requirements</h4>
          <span>{result.total_requirements}</span>
          <div className="small-mono">
            SR:{result.SR.length} WR:{result.WR.length} RR:{result.RR.length}
          </div>
        </div>
        <div className="metric-tile">
          <h4>Criteria</h4>
          <span>{result.total_criteria}</span>
          <div className="small-mono">67 SRC (ISO 25010:2023)</div>
        </div>
        <div className="metric-tile">
          <h4>Coverage</h4>
          <span>{result.overall_coverage_percentage}%</span>
          <div className="small-mono">Non-zero matrix cells</div>
        </div>
        <div className="metric-tile" style={{
          borderLeft: result.total_violations > 0 ? "4px solid #dc2626" : "4px solid #22c55e"
        }}>
          <h4>Violations</h4>
          <span>{result.total_violations}</span>
          <div className="small-mono">
            {result.critical_count > 0 && <span style={{color:"#dc2626"}}>C:{result.critical_count} </span>}
            {result.major_count > 0 && <span style={{color:"#ea580c"}}>M:{result.major_count} </span>}
            {result.minor_count > 0 && <span style={{color:"#eab308"}}>m:{result.minor_count} </span>}
            {result.total_violations === 0 && <span style={{color:"#22c55e"}}>✓ None</span>}
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* ── RADAR CHART ── */}
      <div className="chart-card">
        <h4>ISO/IEC 25010:2023 Quality Characteristic Profile</h4>
        <div className="chart-container" style={{ height: "420px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(15, 23, 42, 0.12)" />
              <PolarAngleAxis
                dataKey="characteristic"
                tick={{ fontSize: 11, fill: "#475569" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: "#94a3b8" }}
              />
              <Radar
                name="Quality Score (%)"
                dataKey="score"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Score"]}
                labelFormatter={(label: string) => {
                  const item = radarData.find(d => d.characteristic === label);
                  return item?.fullName || label;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CHARACTERISTIC BAR CHART ── */}
      <div className="chart-card">
        <h4>Characteristic Scores with Criteria Coverage</h4>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 1]} />
              <Tooltip
                formatter={(value: number) => [formatPct(value), "Score"]}
                labelFormatter={(label: string) => {
                  const item = barData.find(d => d.name === label);
                  return `${item?.fullName} (${item?.covered}/${item?.total} criteria)`;
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {barData.map((_, idx) => (
                  <Cell key={idx} fill={charColors[idx % charColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <hr className="divider" />

      {/* ── CHARACTERISTIC DETAIL CARDS ── */}
      <h3>Characteristic Details</h3>
      <div className="char-grid">
        {result.characteristic_scores.map((cs, idx) => (
          <div key={cs.characteristic_id} className="char-card" style={{
            borderTop: `4px solid ${charColors[idx % charColors.length]}`
          }}>
            <div className="char-card-header">
              <span className="char-name">{cs.characteristic_name}</span>
              <span className="char-score" style={{ color: charColors[idx % charColors.length] }}>
                {formatPct(cs.raw_score)}
              </span>
            </div>
            <div className="status-bar">
              <div className="status-bar-fill" style={{
                width: `${cs.raw_score * 100}%`,
                backgroundColor: charColors[idx % charColors.length]
              }} />
            </div>
            <div className="char-meta">
              {cs.criteria_covered}/{cs.criteria_count} criteria covered
              · w={cs.weight.toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      <hr className="divider" />

      {/* ── VIOLATIONS ── */}
      <h3>Violations ({result.total_violations})</h3>
      {result.violations.length > 0 ? (
        <div className="stack">
          {result.violations.map((v) => (
            <div key={v.violation_id} className="violation-card" style={{
              borderLeft: `5px solid ${severityColors[v.severity] || "#94a3b8"}`
            }}>
              <div className="violation-header">
                <span className="severity-badge" style={{
                  backgroundColor: severityColors[v.severity],
                  color: "white"
                }}>
                  {v.severity}
                </span>
                <span className="violation-char">{v.characteristic_name}</span>
                <span className="violation-score">
                  Score: {formatPct(v.current_score)} → Target: {formatPct(v.threshold)}
                </span>
              </div>
              <p className="violation-desc">{v.description}</p>
              <div className="badge-row">
                {v.affected_criteria.map((c) => (
                  <span key={c} className="tag tag-warning">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="success-banner">
          ✓ No quality violations detected — all characteristics meet threshold requirements.
        </div>
      )}

      <hr className="divider" />

      {/* ── RECOMMENDATIONS ── */}
      <h3>Ranked Recommendations</h3>
      {result.recommendations.length > 0 ? (
        <div className="stack">
          {result.recommendations.map((rec) => (
            <div key={rec.rank} className="rec-card">
              <div className="rec-header">
                <span className="rec-rank">#{rec.rank}</span>
                <span className="rec-effort" style={{
                  backgroundColor: effortColors[rec.effort_estimate] || "#94a3b8",
                  color: rec.effort_estimate === "Medium" ? "#000" : "#fff"
                }}>
                  {rec.effort_estimate} Effort
                </span>
                <span className="rec-ratio">
                  R(aₖ) = {rec.benefit_to_effort.toFixed(4)}
                </span>
              </div>
              <p className="rec-action">{rec.action}</p>
              <div className="rec-meta">
                Target: {rec.target_characteristic} · ΔQ = {rec.expected_delta_q.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="success-banner">
          ✓ No corrective recommendations needed — design meets all quality thresholds.
        </div>
      )}

      <hr className="divider" />

      {/* ── CONSTRAINT CHECKS ── */}
      <h3>Formal Constraint Verification</h3>
      <div className="constraint-list">
        {result.constraint_checks.map((cc) => (
          <div key={cc.constraint_id} className={`constraint-item ${cc.passed ? "pass" : "fail"}`}>
            <span className="constraint-status">{cc.passed ? "✓" : "✗"}</span>
            <div className="constraint-detail">
              <span className="constraint-id">{cc.constraint_id}</span>
              <span className="constraint-name">{cc.constraint_name}</span>
              {!cc.passed && <p className="constraint-msg">{cc.message}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
