import React from "react";
import { CsvUploader } from "./CsvUploader";
import { MatrixEditor } from "./MatrixEditor";

interface Props {
  engineMode: "eidf" | "brcma";
  inputMode: "manual" | "csv";
  setInputMode: (mode: "manual" | "csv") => void;
  data: any;
  setData: (d: any) => void;
  updateMatrix: (i: number, j: number, v: number) => void;
  updateWRC: (i: number, v: number) => void;
  updateWEC: (j: number, v: number) => void;
  handleCsvLoaded: (d: any) => void;
  handleCsvError: (e: string) => void;
  error: string | null;
  loading: boolean;
  onBack: () => void;
  onRun: () => void;
}

export function Step2InputData({ engineMode, inputMode, setInputMode, data, setData, updateMatrix, updateWRC, updateWEC, handleCsvLoaded, handleCsvError, error, loading, onBack, onRun }: Props) {
  return (
    <div className="pb-24 pt-8 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto relative z-10">
      <div className="max-w-4xl mx-auto w-full">
        {/* Sleek Stepper */}
        <div className="w-full flex items-center justify-between mb-section-gap relative">
          {/* Connecting Line Base */}
          <div className="absolute top-4 left-0 w-full h-[2px] bg-outline-variant/50 -z-10"></div>
          {/* Connecting Line Active (up to step 2) */}
          <div className="absolute top-4 left-0 w-1/2 h-[2px] bg-secondary-container -z-10"></div>
          {/* Step 1: Completed */}
          <div className="flex flex-col items-center gap-2 relative z-10 w-1/3">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-[0_0_15px_rgba(33,112,228,0.4)]">
              <span className="material-symbols-outlined text-[18px]" data-icon="check" data-weight="fill" style={{ fontVariationSettings: "\"FILL\" 1" }}>check</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Configure</span>
          </div>
          {/* Step 2: Active */}
          <div className="flex flex-col items-center gap-2 relative z-10 w-1/3">
            <div className="w-8 h-8 rounded-full bg-surface border-2 border-secondary-container flex items-center justify-center relative">
              <div className="w-3 h-3 rounded-full bg-secondary-container animate-pulse"></div>
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full border border-secondary-container opacity-50 scale-150 animate-ping" style={{ animationDuration: "3s" }}></div>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">Input Data</span>
          </div>
          {/* Step 3: Upcoming */}
          <div className="flex flex-col items-center gap-2 relative z-10 w-1/3">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant">
              <span className="font-label-sm text-label-sm">3</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Results</span>
          </div>
        </div>
        {/* Content Area: Input Matrix */}
        <div className="glass-card rounded-xl p-6 md:p-8 relative overflow-hidden border-t-4 border-t-secondary-container">
          <header className="mb-8">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Input Matrix</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Upload your evaluation criteria data via CSV. Ensure your columns align with the required matrix format for accurate EIDF processing.</p>
          </header>
          {/* Segmented Button */}
          <div className="flex p-1 bg-surface-container rounded-full w-full max-w-md mx-auto md:mx-0 mb-8 border border-outline-variant/50 relative">
            <div className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-surface rounded-full shadow-sm transition-transform duration-300 ease-out z-0 ${inputMode === 'csv' ? 'translate-x-[100%]' : ''}`}></div>
            <button 
              onClick={() => setInputMode("manual")}
              className={`flex-1 py-2 px-4 rounded-full font-label-md text-label-md transition-colors duration-200 z-10 relative text-center font-semibold ${inputMode === 'manual' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Manual Input
            </button>
            <button 
              onClick={() => setInputMode("csv")}
              className={`flex-1 py-2 px-4 rounded-full font-label-md text-label-md transition-all duration-300 ease-out z-10 relative text-center font-semibold ${inputMode === 'csv' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              CSV Upload
            </button>
          </div>
          {/* Upload Area (Success State) */}
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
          {error && <div className="mt-4 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-body-md">{error}</div>}
        </div>
        {/* Bottom Actions within Canvas for Desktop */}
        <div className="hidden md:flex justify-between items-center mt-8 px-2">
          <button onClick={onBack} className="px-6 py-3 rounded-full border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container hover:text-on-surface transition-all duration-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" data-icon="arrow_back">arrow_back</span>
            Back
          </button>
          <button onClick={onRun} disabled={loading} className="px-8 py-3 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md hover:bg-[#1a5bb8] transition-all duration-200 shadow-[0_0_15px_rgba(33,112,228,0.3)] hover:shadow-[0_0_20px_rgba(33,112,228,0.5)] flex items-center gap-2 font-semibold hover:text-white">
            {loading ? "Running..." : engineMode === "eidf" ? "Run EIDF Assessment" : "Run Analysis"}
            <span className="material-symbols-outlined text-[18px]" data-icon="play_arrow" data-weight="fill" style={{ fontVariationSettings: "\"FILL\" 1" }}>play_arrow</span>
          </button>
        </div>
      </div>
      {/* Mobile Action Bar (Sticky above BottomNav on mobile) */}
      <div className="md:hidden fixed bottom-[80px] left-0 w-full px-4 z-40">
        <button onClick={onRun} disabled={loading} className="w-full py-3.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md shadow-[0_4px_20px_rgba(33,112,228,0.4)] flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform hover:text-white hover:bg-secondary">
          {loading ? "Running..." : engineMode === "eidf" ? "Run EIDF Assessment" : "Run Analysis"}
          <span className="material-symbols-outlined text-[18px]" data-icon="play_arrow" data-weight="fill" style={{ fontVariationSettings: "\"FILL\" 1" }}>play_arrow</span>
        </button>
      </div>
    </div>
  );
}
