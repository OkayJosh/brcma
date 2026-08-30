import { useState } from "react";
import { runBrcma, runEidf } from "./lib/api";
import { ResultsView } from "./components/ResultsView";
import { EidfResultsView } from "./components/EidfResultsView";
import { MatrixEditor } from "./components/MatrixEditor";
import { CsvUploader } from "./components/CsvUploader";
import { Step1Configure } from "./components/Step1Configure";
import { Step2InputData } from "./components/Step2InputData";
import { Step3Results } from "./components/Step3Results";
import { Layout } from "./components/Layout";

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
  R: ["Login Module", "Patient Records", "Billing API"],
  C: ["EC-FS-01", "EC-PE-01", "EC-SC-01", "EC-US-01"],
  WRC: [1, 1, 1],
  WEC: [1, 1, 1, 1],
  S: [
    [0.9, 0.8, 1.0, 0.8],
    [0.2, 0.4, 0.3, 0.9],
    [0.0, 0.5, 0.9, 0.0],
  ],
};

export default function App() {
  const [data, setData] = useState<BrcmaInput>(demo);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"manual" | "csv">("manual");
  const [engineMode, setEngineMode] = useState<"brcma" | "eidf">("eidf");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState("generic");

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
      setCurrentStep(3);
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
    <Layout currentStep={currentStep}>
      {currentStep === 1 && (
        <Step1Configure 
          engineMode={engineMode}
          setEngineMode={setEngineMode}
          selectedDomain={selectedDomain}
          setSelectedDomain={setSelectedDomain}
          onNext={() => setCurrentStep(2)}
        />
      )}
      
      {currentStep === 2 && (
        <Step2InputData 
          engineMode={engineMode}
          inputMode={inputMode}
          setInputMode={setInputMode}
          data={data}
          setData={setData}
          updateMatrix={updateMatrix}
          updateWRC={updateWRC}
          updateWEC={updateWEC}
          handleCsvLoaded={handleCsvLoaded}
          handleCsvError={handleCsvError}
          error={error}
          loading={loading}
          onBack={() => setCurrentStep(1)}
          onRun={onRun}
        />
      )}

      {currentStep === 3 && (
        <Step3Results 
          engineMode={engineMode}
          result={result}
          data={data}
          onBack={() => setCurrentStep(2)}
          onStartOver={() => {
            setCurrentStep(1);
            setResult(null);
          }}
        />
      )}
    </Layout>
  );
}