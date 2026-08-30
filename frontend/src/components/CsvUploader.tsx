import React, { useRef, useState } from "react";

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

type Props = {
  onDataLoaded: (data: BrcmaInput) => void;
  onError: (error: string) => void;
};

export const CsvUploader: React.FC<Props> = ({ onDataLoaded, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewData, setPreviewData] = useState<BrcmaInput | null>(null);

  const parseCSV = (text: string): BrcmaInput | null => {
    try {
      const lines = text.trim().split("\n").map((line) => line.split(",").map((cell) => cell.trim()));

      if (lines.length < 3) {
        throw new Error("CSV must have at least 3 rows (header + 1 requirement + WEC row)");
      }

      // First row: header with criteria names (skip first cell which is empty or "Req/Crit")
      const header = lines[0];
      const C = header.slice(1, header.findIndex((cell, idx) => idx > 0 && (cell.toUpperCase() === "WRC" || cell === "")));

      if (C.length === 0) {
        throw new Error("No criteria found in header row");
      }

      // Find WEC row (last row)
      const wecRowIndex = lines.findIndex((line) => line[0].toUpperCase() === "WEC");
      const hasWecRow = wecRowIndex !== -1;

      // Requirement rows (all rows between header and WEC row, or all rows after header)
      const requirementRows = hasWecRow
        ? lines.slice(1, wecRowIndex)
        : lines.slice(1);

      if (requirementRows.length === 0) {
        throw new Error("No requirements found in CSV");
      }

      const R: string[] = [];
      const WRC: number[] = [];
      const S: number[][] = [];

      // Parse requirement rows
      for (const row of requirementRows) {
        if (row.length < 2) continue; // Skip empty rows

        const reqName = row[0];
        if (!reqName) continue;

        R.push(reqName);

        // Parse similarity values
        const similarities: number[] = [];
        for (let j = 0; j < C.length; j++) {
          const value = parseFloat(row[j + 1]);
          similarities.push(isNaN(value) ? 0 : Math.max(0, Math.min(1, value)));
        }
        S.push(similarities);

        // Parse WRC (weight for this requirement)
        const wrcIndex = C.length + 1;
        const wrcValue = parseFloat(row[wrcIndex]);
        WRC.push(isNaN(wrcValue) ? 1 : wrcValue);
      }

      // Parse WEC (weights for criteria)
      let WEC: number[] = [];
      if (hasWecRow) {
        const wecRow = lines[wecRowIndex];
        for (let j = 0; j < C.length; j++) {
          const value = parseFloat(wecRow[j + 1]);
          WEC.push(isNaN(value) ? 1 : value);
        }
      } else {
        // Default weights of 1 for all criteria
        WEC = Array(C.length).fill(1);
      }

      return {
        R,
        C,
        WRC,
        WEC,
        S,
        thr_sr: 0.75,
        thr_wr: 0.30,
        thr_mr: 0.30,
      };
    } catch (e: any) {
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      onError("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);

      if (data) {
        setPreviewData(data);
        onDataLoaded(data);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        onError("Failed to parse CSV. Please check the format.");
      }
    };

    reader.onerror = () => {
      onError("Failed to read file");
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `,EC-FS-01,EC-PE-01,EC-SC-01,EC-US-01,WRC
Login Module,0.9,0.8,1.0,0.8,1
Patient Records,0.2,0.4,0.3,0.9,1
Billing API,0.0,0.5,0.9,0.0,1
WEC,1,1,1,1,`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brcma_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="csv-uploader stack">
      {previewData ? (
        <div className="upload-preview" style={{ border: "1px solid var(--border-soft)", borderRadius: "8px", padding: "16px", background: "var(--surface)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, color: "#15803d", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              CSV Loaded Successfully
            </h4>
            <button className="button button-secondary" onClick={() => setPreviewData(null)} style={{ padding: "4px 10px", fontSize: "12px" }}>
              Replace File
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="matrix-table" style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(15, 23, 42, 0.04)" }}>
                  <th style={{ padding: "8px", borderBottom: "1px solid var(--border-soft)", textAlign: "left" }}>Req \\ Crit</th>
                  {previewData.C.slice(0, 5).map(c => <th key={c} style={{ padding: "8px", borderBottom: "1px solid var(--border-soft)", textAlign: "center" }}>{c}</th>)}
                  {previewData.C.length > 5 && <th style={{ padding: "8px", borderBottom: "1px solid var(--border-soft)", textAlign: "center", color: "var(--text-muted)" }}>... ({previewData.C.length} total)</th>}
                </tr>
              </thead>
              <tbody>
                {previewData.R.slice(0, 4).map((r, i) => (
                  <tr key={r}>
                    <td style={{ padding: "8px", borderBottom: "1px solid var(--border-soft)" }}><strong>{r}</strong></td>
                    {previewData.S[i].slice(0, 5).map((s, j) => <td key={j} style={{ padding: "8px", borderBottom: "1px solid var(--border-soft)", textAlign: "center" }}>{s}</td>)}
                    {previewData.C.length > 5 && <td style={{ padding: "8px", borderBottom: "1px solid var(--border-soft)", textAlign: "center", color: "var(--text-muted)" }}>...</td>}
                  </tr>
                ))}
                {previewData.R.length > 4 && (
                  <tr>
                    <td colSpan={Math.min(previewData.C.length, 5) + 2} style={{ textAlign: "center", color: "var(--text-muted)", padding: "12px", background: "rgba(15, 23, 42, 0.02)" }}>
                      ... and {previewData.R.length - 4} more requirements
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="file-input"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="upload-label">
            <div className="upload-icon">📊</div>
            <span className="upload-text">Click to upload CSV</span>
            <span className="upload-hint">or drag and drop</span>
          </label>
        </div>
      )}

      <div className="csv-info subtle-card stack">
        <h4>CSV Format</h4>
        <p className="section-description">
          Upload a CSV with criteria in columns and requirements in rows. Include WRC (requirement weights)
          in the last column and WEC (criterion weights) in the last row. Weights are applied before matching.
        </p>
        <div className="csv-example">
          <pre className="code-block">
{`,EC-FS-01,EC-PE-01,EC-SC-01,EC-US-01,WRC
Login Module,0.9,0.8,1.0,0.8,1
Patient Records,0.2,0.4,0.3,0.9,1
WEC,1,1,1,1,`}
          </pre>
        </div>
        <button className="button button-secondary" onClick={downloadTemplate}>
          Download Template
        </button>
      </div>
    </div>
  );
};
