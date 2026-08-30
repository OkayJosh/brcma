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
    <div className="flex flex-col gap-8 w-full">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <button 
            className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container hover:text-on-surface transition-all duration-200 flex items-center gap-2"
            onClick={addRequirement} type="button">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Requirement
          </button>
          <button 
            className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container hover:text-on-surface transition-all duration-200 flex items-center gap-2"
            onClick={addCriterion} type="button">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Criterion
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel border-t-2 border-t-primary rounded-xl p-4 flex flex-col gap-1">
          <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Requirements</h4>
          <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">{n}</span>
        </div>
        <div className="glass-panel border-t-2 border-t-secondary rounded-xl p-4 flex flex-col gap-1">
          <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Criteria</h4>
          <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">{m}</span>
        </div>
        <div className="glass-panel border-t-2 border-t-tertiary-fixed-dim rounded-xl p-4 flex flex-col gap-1">
          <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Matrix Entries</h4>
          <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">{n * m}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-label-md text-label-md text-on-surface">Data Editor</h4>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Edit values directly</span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-outline-variant/50 bg-surface-container-lowest shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container/50">
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider min-w-[200px]">
                  Req \\ Crit
                </th>
                {data.C.map((c, j) => (
                  <th key={j} className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider min-w-[150px]">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-on-surface-variant">Criterion Name</span>
                        <input
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                          aria-label={`Criterion ${j + 1} name`}
                          value={c}
                          onChange={(e) => renameCriterion(j, e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-on-surface-variant">Weight</span>
                        <input
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-on-surface focus:outline-none focus:border-secondary transition-colors"
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
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {data.R.map((r, i) => (
                <tr key={i} className="border-b border-outline-variant/30 hover:bg-surface-container/30 transition-colors">
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-wider">Requirement</span>
                        <input
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-on-surface font-medium focus:outline-none focus:border-secondary transition-colors"
                          aria-label={`Requirement ${i + 1} name`}
                          value={r}
                          onChange={(e) => renameRequirement(i, e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-wider">Weight</span>
                        <input
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-on-surface-variant focus:outline-none focus:border-secondary transition-colors"
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
                      </div>
                    </div>
                  </td>
                  {data.C.map((_, j) => (
                    <td key={j} className="p-4 align-top">
                      <div className="flex flex-col gap-1 mt-6">
                        <span className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-wider">Similarity</span>
                        <input
                          className="w-full bg-surface-container-low border border-outline-variant rounded px-2 py-1 text-secondary font-medium focus:outline-none focus:border-secondary transition-colors text-center"
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
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thresholds */}
      <div className="w-full">
        <h4 className="font-label-md text-label-md text-on-surface mb-4">Analysis Thresholds</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {thresholds.map(({ key, label, description, defaultValue }) => (
            <div key={key} className="glass-panel border-t border-t-outline-variant/30 rounded-lg p-4 flex flex-col gap-3">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">{label}</span>
              <input
                className="bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface focus:outline-none focus:border-secondary transition-colors"
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
              <span className="text-xs text-on-surface-variant leading-relaxed">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
