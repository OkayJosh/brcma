import React from "react";

interface Props {
  engineMode: "eidf" | "brcma";
  setEngineMode: (mode: "eidf" | "brcma") => void;
  selectedDomain: string;
  setSelectedDomain: (d: string) => void;
  onNext: () => void;
}

export function Step1Configure({ engineMode, setEngineMode, selectedDomain, setSelectedDomain, onNext }: Props) {
  return (
    <div className="max-w-3xl mx-auto w-full pt-8 pb-32 md:pb-8 p-margin-mobile md:p-margin-desktop">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-container-high -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-secondary -z-10 transition-all duration-500 ease-in-out"></div>
          {/* Step 1: Configure (Active) */}
          <div className="flex flex-col items-center gap-2 bg-background px-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-[0_0_0_4px_rgba(0,88,190,0.2)] animate-pulse">
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>settings</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary">Configure</span>
          </div>
          {/* Step 2: Input Data */}
          <div className="flex flex-col items-center gap-2 bg-background px-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center border-2 border-surface-container-highest">
              <span className="font-label-md text-label-md">2</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Input Data</span>
          </div>
          {/* Step 3: Results */}
          <div className="flex flex-col items-center gap-2 bg-background px-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center border-2 border-surface-container-highest">
              <span className="font-label-md text-label-md">3</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Results</span>
          </div>
        </div>
      </div>
      {/* Page Header */}
      <div className="mb-10">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Configuration</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Define the core parameters and context for the EIDF assessment.</p>
      </div>
      {/* Assessment Cards Container (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Engine Selection Card */}
        <div className="glass-panel rounded-xl p-8 relative overflow-hidden border-t-4 border-t-secondary">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Choose Assessment Engine</h3>
          {/* Segmented Buttons */}
          <div className="bg-surface-container p-1 rounded-full flex relative mb-4">
            <div className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded-full transition-transform duration-300 ease-in-out ${engineMode === 'brcma' ? 'translate-x-[100%]' : ''}`}></div>
            <button 
              onClick={() => setEngineMode("eidf")}
              className={`relative z-10 flex-1 py-2.5 font-label-md text-label-md rounded-full transition-colors font-medium ${engineMode === 'eidf' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              EIDF Enhanced
            </button>
            <button 
              onClick={() => setEngineMode("brcma")}
              className={`relative z-10 flex-1 py-2.5 font-label-md text-label-md rounded-full transition-colors font-medium ${engineMode === 'brcma' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              BRCMA Original
            </button>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">Enhanced mode utilizes advanced heuristic models for deeper analysis.</p>
        </div>
        {/* Domain Context Card */}
        <div className="glass-panel rounded-xl p-8 relative overflow-hidden border-t-4 border-t-tertiary-fixed-dim">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Domain Context</h3>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="domain-select">Select Domain</label>
            <div className="relative">
              <select 
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-3 px-4 font-body-md text-body-md select-glass transition-all duration-200" 
                id="domain-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="generic">Generic</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="airline">Airline</option>
                <option value="telecom">Telecommunications</option>
                <option value="government">Government / Defense</option>
              </select>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">Tailors the assessment criteria to industry-specific standards.</p>
          </div>
        </div>
      </div>
      {/* Footer Actions */}
      <div className="mt-12 flex justify-end pb-8">
        <button 
          onClick={onNext}
          className="bg-secondary text-on-secondary px-8 py-3 rounded-lg font-label-md text-label-md font-medium hover:bg-on-secondary-fixed-variant transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          Next Step
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
