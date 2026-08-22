import { useState } from "react";
import { runBrcma, runEidf } from "./lib/api";
import { ResultsView } from "./components/ResultsView";
import { EidfResultsView } from "./components/EidfResultsView";
import { MatrixEditor } from "./components/MatrixEditor";
import { CsvUploader } from "./components/CsvUploader";

type BrcmaInput = {
  R: string[];
  C: string[];
  WRC: number[];
  WEC: number[];
  S: number[][];
  thr_sr?: number;
  thr_wr?: number;
  thr_mr?: number;
  // EIDF extensions
  R_descriptions?: string[];
  C_characteristic?: string[];
  W_char?: Record<string, number>;
};

const demo: BrcmaInput = {
  R: ["r1", "r2", "r3"],
  C: ["c1", "c2", "c3"],
  WRC: [1, 1, 1],
  WEC: [1, 1, 1],
  S: [
    [0.9, 0.8, 0.6],
    [0.2, 0.4, 0.3],
    [0.0, 0.0, 0.0],
  ],
};

export default function App() {
  const [data, setData] = useState<BrcmaInput>(demo);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"manual" | "csv">("manual");
  const [engineMode, setEngineMode] = useState<"brcma" | "eidf">("eidf");

  function updateMatrix(i: number, j: number, v: number) {
    const S = data.S.map((row) => row.slice());
    S[i][j] = Math.max(0, Math.min(1, v));
    setData({ ...data, S });
  }

  function updateWRC(i: number, v: number) {
    const WRC = data.WRC.slice();
    WRC[i] = v;
    setData({ ...data, WRC });
  }
  function updateWEC(j: number, v: number) {
    const WEC = data.WEC.slice();
    WEC[j] = v;
    setData({ ...data, WEC });
  }

  async function onRun() {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (engineMode === "eidf") {
        // Add C_characteristic if not present (auto-detect from criterion IDs)
        const payload = { ...data };
        if (!payload.C_characteristic || payload.C_characteristic.length === 0) {
          // Auto-map: EC-FS-* -> QC-01, EC-PE-* -> QC-02, etc.
          const prefixMap: Record<string, string> = {
            "EC-FS": "QC-01", "EC-PE": "QC-02", "EC-CO": "QC-03",
            "EC-US": "QC-04", "EC-RE": "QC-05", "EC-SC": "QC-06",
            "EC-MA": "QC-07", "EC-PO": "QC-08", "EC-SF": "QC-09",
          };
          payload.C_characteristic = payload.C.map((c) => {
            const prefix = c.substring(0, 5);
            return prefixMap[prefix] || "QC-01";
          });
        }
        res = await runEidf(payload);
      } else {
        res = await runBrcma(data);
      }
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  function handleCsvLoaded(csvData: BrcmaInput) {
    setData(csvData);
    setError(null);
    setResult(null);
  }

  function handleCsvError(errorMsg: string) {
    setError(errorMsg);
  }

  function exportToCSV() {
    const rows: string[] = [];
    const header = ["", ...data.C, "WRC"];
    rows.push(header.join(","));
    for (let i = 0; i < data.R.length; i++) {
      const row = [data.R[i], ...data.S[i].map(v => v.toString()), data.WRC[i].toString()];
      rows.push(row.join(","));
    }
    const wecRow = ["WEC", ...data.WEC.map(v => v.toString()), ""];
    rows.push(wecRow.join(","));
    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brcma_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const isEidfResult = engineMode === "eidf" && result?.Q_S !== undefined;

  return (
    <div className="app-shell">
      <header className="hero">
        <span className="hero-eyebrow">
          {engineMode === "eidf" ? "EIDF — Evaluation-Integrated Design Framework" : "Decision Support"}
        </span>
        <h1>
          {engineMode === "eidf"
            ? "EIDF — Design-Time Quality Assessment"
            : "BRCMA — Bi-Directional Requirement–Criterion Matching"
          }
        </h1>
        <p>
          {engineMode === "eidf"
            ? "Assess design quality against ISO/IEC 25010:2023 using the Q(S) composite scoring function. Upload your requirement-criterion matrix, run the EIDF-DTAA, and get characteristic-level scores, violation detection, and ranked recommendations."
            : "Configure your requirement matrix, set requirement and criterion weights, and run the analysis to uncover requirement strength, coverage, and recommended design options."
          }
        </p>
      </header>

      <main className="page-content">
        {/* Engine Mode Selector */}
        <section className="card">
          <div className="stack">
            <h2 className="section-title">Assessment Engine</h2>
          </div>
          <div className="engine-selector">
            <div className="segmented">
              <button
                className={engineMode === "eidf" ? "active eidf-active" : ""}
                onClick={() => { setEngineMode("eidf"); setResult(null); }}
              >
                🔬 EIDF Enhanced
              </button>
              <button
                className={engineMode === "brcma" ? "active" : ""}
                onClick={() => { setEngineMode("brcma"); setResult(null); }}
              >
                📊 BRCMA Original
              </button>
            </div>
            {engineMode === "eidf" && (
              <div className="engine-badge">
                ISO/IEC 25010:2023 · Q(S) Scoring · Violation Detection · 67 SRC Criteria
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="stack">
            <h2 className="section-title">Input Matrix</h2>
            <p className="section-description">
              {engineMode === "eidf"
                ? "Upload a CSV with SRS requirements (rows) × SRC evaluation criteria (columns). Use the three-level scale: 0.0 (Not Addressed), 0.5 (Partially), 1.0 (Fully)."
                : "Choose your input method and configure the data. Weights are applied before matching."
              }
            </p>
          </div>

          <div className="input-mode-selector">
            <div className="segmented">
              <button
                className={inputMode === "manual" ? "active" : ""}
                onClick={() => setInputMode("manual")}
              >
                Manual Input
              </button>
              <button
                className={inputMode === "csv" ? "active" : ""}
                onClick={() => setInputMode("csv")}
              >
                CSV Upload
              </button>
            </div>
            {inputMode === "manual" && (
              <button className="button button-secondary" onClick={exportToCSV}>
                Export to CSV
              </button>
            )}
          </div>

          {inputMode === "manual" ? (
            <MatrixEditor
              data={data}
              onMatrixChange={updateMatrix}
              onWRCChange={updateWRC}
              onWECChange={updateWEC}
              setData={setData}
            />
          ) : (
            <CsvUploader onDataLoaded={handleCsvLoaded} onError={handleCsvError} />
          )}

          <hr className="divider" />

          <div className="button-row">
            <button
              className={`button ${engineMode === "eidf" ? "button-eidf" : ""}`}
              onClick={onRun}
              disabled={loading}
            >
              {loading
                ? "Running assessment…"
                : engineMode === "eidf"
                  ? "🔬 Run EIDF Assessment"
                  : "Run analysis"
              }
            </button>
            {error && <span className="inline-error">{error}</span>}
          </div>
        </section>

        <section className="card">
          <div className="stack">
            <h2 className="section-title">
              {engineMode === "eidf" ? "EIDF Assessment Results" : "Results"}
            </h2>
            <p className="section-description">
              {engineMode === "eidf"
                ? "Composite quality score Q(S), ISO/IEC 25010:2023 characteristic profile, violations, and ranked recommendations."
                : "Visual summaries and classifications appear once the analysis completes."
              }
            </p>
          </div>
          {result ? (
            isEidfResult ? (
              <EidfResultsView result={result} R={data.R} C={data.C} />
            ) : (
              <ResultsView result={result} R={data.R} C={data.C} />
            )
          ) : (
            <div className="empty-state">
              {engineMode === "eidf"
                ? "Upload your requirement-criterion matrix and run the EIDF assessment to see Q(S) scores, characteristic profiles, and recommendations."
                : "Run the analysis to populate requirement strength and design options."
              }
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
