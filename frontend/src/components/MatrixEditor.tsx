import React from "react";

type Props = {
  data: {
    R: string[];
    C: string[];
    WRC: number[];
    WEC: number[];
    S: number[][];
    thr_sr?: number;
    thr_wr?: number;
    thr_mr?: number;
  };
  onMatrixChange: (i: number, j: number, v: number) => void;
  onWRCChange: (i: number, v: number) => void;
  onWECChange: (j: number, v: number) => void;
  setData: (d: any) => void;
};

type ThresholdKey = "thr_sr" | "thr_wr" | "thr_mr";

export const MatrixEditor: React.FC<Props> = ({ data, onMatrixChange, onWRCChange, onWECChange, setData }) => {
  const n = data.R.length;
  const m = data.C.length;

  function addRequirement() {
    setData({
      ...data,
      R: [...data.R, `r${n + 1}`],
      WRC: [...data.WRC, 1],
      S: [...data.S, Array(m).fill(0)],
    });
  }

  function addCriterion() {
    setData({
      ...data,
      C: [...data.C, `c${m + 1}`],
      WEC: [...data.WEC, 1],
      S: data.S.map((row) => [...row, 0]),
    });
  }

  function renameRequirement(i: number, value: string) {
    const R = data.R.slice();
    R[i] = value;
    setData({ ...data, R });
  }

  function renameCriterion(j: number, value: string) {
    const C = data.C.slice();
    C[j] = value;
    setData({ ...data, C });
  }

  function updateThreshold(key: ThresholdKey, value: number) {
    setData({ ...data, [key]: value });
  }

  const thresholds: { key: ThresholdKey; label: string; description: string; defaultValue: number }[] = [
    {
      key: "thr_sr",
      label: "Strong requirement (SR)",
      description: "Similarity score required for a requirement to be considered strong.",
      defaultValue: 0.75,
    },
    {
      key: "thr_wr",
      label: "Weak requirement (WR)",
      description: "Minimum weight that elevates a requirement to weak coverage.",
      defaultValue: 0.3,
    },
    {
      key: "thr_mr",
      label: "Missing requirement (MR)",
      description: "Coverage threshold that flags criteria as missing or underserved.",
      defaultValue: 0.3,
    },
  ];

  return (
    <div className="stack">
      <div className="button-row">
        <button className="button button-secondary" onClick={addRequirement} type="button">
          + Requirement
        </button>
        <button className="button button-secondary" onClick={addCriterion} type="button">
          + Criterion
        </button>
      </div>

      <div className="metric-grid">
        <div className="metric-tile">
          <h4>Total requirements</h4>
          <span>{n}</span>
        </div>
        <div className="metric-tile">
          <h4>Total criteria</h4>
          <span>{m}</span>
        </div>
        <div className="metric-tile">
          <h4>Matrix entries</h4>
          <span>{n * m}</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <div className="table-label">
                  <span className="field-label">Req / Crit</span>
                  <span>Similarity</span>
                </div>
              </th>
              {data.C.map((c, j) => (
                <th key={j}>
                  <div className="cell-stack">
                    <label className="table-label">
                      <span className="field-label">Criterion</span>
                      <input
                        className="input"
                        aria-label={`Criterion ${j + 1} name`}
                        value={c}
                        onChange={(e) => renameCriterion(j, e.target.value)}
                      />
                    </label>
                    <label className="table-label">
                      <span className="field-label">Weight</span>
                      <input
                        className="input"
                        type="number"
                        step="0.05"
                        value={data.WEC[j]}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          if (!Number.isNaN(next)) {
                            onWECChange(j, next);
                          }
                        }}
                      />
                    </label>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.R.map((r, i) => (
              <tr key={i}>
                <td>
                  <div className="cell-stack">
                    <label className="table-label">
                      <span className="field-label">Requirement</span>
                      <input
                        className="input"
                        aria-label={`Requirement ${i + 1} name`}
                        value={r}
                        onChange={(e) => renameRequirement(i, e.target.value)}
                      />
                    </label>
                    <div className="cell-meta">
                      <label className="table-label">
                        <span className="field-label">Weight</span>
                        <input
                          className="input"
                          type="number"
                          step="0.05"
                          value={data.WRC[i]}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            if (!Number.isNaN(next)) {
                              onWRCChange(i, next);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </td>
                {data.C.map((_, j) => (
                  <td key={j}>
                    <label className="table-label">
                      <span className="field-label">Similarity</span>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        max={1}
                        step={0.05}
                        value={data.S[i][j]}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          if (!Number.isNaN(next)) {
                            onMatrixChange(i, j, next);
                          }
                        }}
                        aria-label={`Similarity for ${data.R[i]} vs ${data.C[j]}`}
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-split">
        {thresholds.map(({ key, label, description, defaultValue }) => (
          <div key={key} className="subtle-card stack">
            <span className="field-label">{label}</span>
            <input
              className="input"
              type="number"
              step="0.05"
              value={(data[key] as number | undefined) ?? defaultValue}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isNaN(next)) {
                  updateThreshold(key, next);
                }
              }}
            />
            <span className="table-note">{description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
