import { useState } from "react";
import { runBrcma } from "./lib/api";
import { ResultsView } from "./components/ResultsView";
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
      const res = await runBrcma(data);
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
    setResult(null); // Clear previous results
  }

  function handleCsvError(errorMsg: string) {
    setError(errorMsg);
  }

  function exportToCSV() {
    const rows: string[] = [];

    // Header row: criteria names + WRC column
    const header = ["", ...data.C, "WRC"];
    rows.push(header.join(","));

    // Requirement rows
    for (let i = 0; i < data.R.length; i++) {
      const row = [data.R[i], ...data.S[i].map(v => v.toString()), data.WRC[i].toString()];
      rows.push(row.join(","));
    }

    // WEC row
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

  return (
    <div className="app-shell">
      <header className="hero">
        <span className="hero-eyebrow">Decision Support</span>
        <h1>BRCMA – Bi-Directional Requirement–Criterion Matching</h1>
        <p>
          Configure your requirement matrix, tune weights, and run the analysis to uncover requirement strength,
          coverage, and recommended design options.
        </p>
      </header>

      <main className="page-content">
        <section className="card">
          <div className="stack">
            <h2 className="section-title">Input Matrix</h2>
            <p className="section-description">Choose your input method and configure the data before running BRCMA.</p>
          </div>

          {/* Input Mode Selector */}
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
            <button className="button" onClick={onRun} disabled={loading}>
              {loading ? "Running analysis…" : "Run analysis"}
            </button>
            {error && <span className="inline-error">{error}</span>}
          </div>
          <p className="table-note">Matrix values are clamped between 0 and 1 to ensure valid similarity scores.</p>
        </section>

        <section className="card">
          <div className="stack">
            <h2 className="section-title">Results</h2>
            <p className="section-description">Visual summaries and classifications appear once the analysis completes.</p>
          </div>
          {result ? (
            <ResultsView result={result} R={data.R} C={data.C} />
          ) : (
            <div className="empty-state">Run the analysis to populate requirement strength and design options.</div>
          )}
        </section>
      </main>
    </div>
  );
}
