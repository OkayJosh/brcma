import React, { useRef } from "react";

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
    const template = `,c1,c2,c3,WRC
r1,0.9,0.8,0.6,1
r2,0.2,0.4,0.3,1
r3,0.0,0.0,0.0,1
WEC,1,1,1,`;

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

      <div className="csv-info subtle-card stack">
        <h4>CSV Format</h4>
        <p className="section-description">
          Upload a CSV with criteria in columns and requirements in rows. Include WRC (requirement weights)
          in the last column and WEC (criterion weights) in the last row.
        </p>
        <div className="csv-example">
          <pre className="code-block">
{`,c1,c2,c3,WRC
r1,0.9,0.8,0.6,1
r2,0.2,0.4,0.3,1
WEC,1,1,1,`}
          </pre>
        </div>
        <button className="button button-secondary" onClick={downloadTemplate}>
          Download Template
        </button>
      </div>
    </div>
  );
};
