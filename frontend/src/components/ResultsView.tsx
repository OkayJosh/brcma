import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { StatusDashboard } from "./StatusDashboard";

type Props = {
  result: any;
  R: string[];
  C: string[];
};

const formatDecimal = (value: number | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return value.toFixed(2);
};

export const ResultsView: React.FC<Props> = ({ result, R, C }) => {
  const rsData = (R ?? []).map((r, i) => ({ name: r, RS: result.RS?.[i] ?? 0, RS_norm: result.RS_norm?.[i] ?? 0 }));
  const ccData = (C ?? []).map((c, j) => ({ name: c, CC: result.CC?.[j] ?? 0, CC_norm: result.CC_norm?.[j] ?? 0 }));

  const unique = (indices: number[] = []) => Array.from(new Set(indices)).filter((idx) => idx >= 0);

  const srNames = unique(result.SR).map((i) => R[i] ?? `R${i + 1}`);
  const wrNames = unique(result.WR).map((i) => R[i] ?? `R${i + 1}`);
  const rrNames = unique(result.RR).map((i) => R[i] ?? `R${i + 1}`);
  const mrNames = unique(result.MR).map((j) => C[j] ?? `C${j + 1}`);

  const average = (arr: number[]) => (arr.length ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0);
  const avgRSNorm = average(result.RS_norm ?? []);
  const avgCCNorm = average(result.CC_norm ?? []);

  const topRequirement = rsData.reduce<{ name: string; RS_norm: number } | null>((best, item) => {
    if (!best || item.RS_norm > best.RS_norm) {
      return { name: item.name, RS_norm: item.RS_norm };
    }
    return best;
  }, null);

  const topCriterion = ccData.reduce<{ name: string; CC_norm: number } | null>((best, item) => {
    if (!best || item.CC_norm > best.CC_norm) {
      return { name: item.name, CC_norm: item.CC_norm };
    }
    return best;
  }, null);

  const chartTooltipFormatter = (value: number) => formatDecimal(value);

  return (
    <div className="results-section">
      {/* Status Dashboard - Visual Summary */}
      <StatusDashboard result={result} R={R} C={C} />

      <hr className="divider" />

      <h3>Detailed Analysis</h3>

      <div className="metric-grid">
        <div className="metric-tile">
          <h4>Avg RS (norm)</h4>
          <span>{formatDecimal(avgRSNorm)}</span>
          <div className="small-mono">Top contributor: {topRequirement?.name ?? "—"}</div>
        </div>
        <div className="metric-tile">
          <h4>Avg CC (norm)</h4>
          <span>{formatDecimal(avgCCNorm)}</span>
          <div className="small-mono">Best covered: {topCriterion?.name ?? "—"}</div>
        </div>
        <div className="metric-tile">
          <h4>Design options</h4>
          <span>{result.design_options?.length ?? 0}</span>
          <div className="small-mono">Auto-generated recommendations</div>
        </div>
      </div>

      <div className="chart-card">
        <h4>Requirement Strength</h4>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: number | string) => chartTooltipFormatter(typeof value === "number" ? value : Number(value))}
                cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
              />
              <Bar dataKey="RS_norm" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h4>Criterion Coverage</h4>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ccData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: number | string) => chartTooltipFormatter(typeof value === "number" ? value : Number(value))}
                cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
              />
              <Bar dataKey="CC_norm" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="subtle-card stack">
        <h3>Classification</h3>
        <div>
          <span className="field-label">Strong requirements (SR)</span>
          <div className="badge-row">
            {srNames.length ? srNames.map((name) => <span className="tag" key={`sr-${name}`}>{name}</span>) : <span className="small-mono">—</span>}
          </div>
        </div>
        <div>
          <span className="field-label">Weak requirements (WR)</span>
          <div className="badge-row">
            {wrNames.length ? wrNames.map((name) => <span className="tag" key={`wr-${name}`}>{name}</span>) : <span className="small-mono">—</span>}
          </div>
        </div>
        <div>
          <span className="field-label">Revisit requirements (RR)</span>
          <div className="badge-row">
            {rrNames.length ? rrNames.map((name) => <span className="tag" key={`rr-${name}`}>{name}</span>) : <span className="small-mono">—</span>}
          </div>
        </div>
        <div>
          <span className="field-label">Missing requirements (MR)</span>
          <div className="badge-row">
            {mrNames.length ? mrNames.map((name) => <span className="tag" key={`mr-${name}`}>{name}</span>) : <span className="small-mono">—</span>}
          </div>
        </div>
      </div>

      <div className="stack">
        <h3>Design options</h3>
        {result.design_options?.length ? (
          <ul className="list-reset">
            {result.design_options.map((option: any, idx: number) => {
              const requirementNames = unique(option.requirements ?? []).map((i) => R[i] ?? `R${i + 1}`);
              const criteriaNames = unique(option.criteria ?? []).map((j) => C[j] ?? `C${j + 1}`);

              return (
                <li key={idx} className="design-option">
                  <div>
                    <b>{option.name}</b>
                    <p className="section-description description-spacer">{option.description}</p>
                  </div>
                  <div>
                    <span className="field-label">Requirements</span>
                    <div className="badge-row">
                      {requirementNames.length ? requirementNames.map((name) => <span className="tag" key={`opt-r-${idx}-${name}`}>{name}</span>) : <span className="small-mono">—</span>}
                    </div>
                  </div>
                  <div>
                    <span className="field-label">Criteria</span>
                    <div className="badge-row">
                      {criteriaNames.length ? criteriaNames.map((name) => <span className="tag" key={`opt-c-${idx}-${name}`}>{name}</span>) : <span className="small-mono">—</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state">No suggested design options were returned for this data set.</div>
        )}
      </div>
    </div>
  );
};
