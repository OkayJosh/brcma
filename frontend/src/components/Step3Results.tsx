import React from "react";
import { ResultsView } from "./ResultsView";

interface Props {
  engineMode: "eidf" | "brcma";
  result: any;
  data: any;
  onBack: () => void;
  onStartOver: () => void;
}

export function Step3Results({ engineMode, result, data, onBack, onStartOver }: Props) {
  if (engineMode === "brcma") {
    return (
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 relative z-10 h-full">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8">BRCMA Assessment Results</h2>
        <ResultsView result={result} R={data?.R || []} C={data?.C || []} />
        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-outline-variant/30">
          <button onClick={onStartOver} className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest transition-colors">Start Over</button>
          <button onClick={onBack} className="px-6 py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container transition-all">Modify Data</button>
        </div>
      </div>
    );
  }

  const scoreNum = result?.Q_S !== undefined ? Math.round(result.Q_S * 100) : 0;
  const strokeDashoffset = 251.2 - ((result?.Q_S || 0) * 251.2);

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex flex-col items-center">
      {/* Sleek Stepper */}
      <div className="w-full max-w-2xl mb-12 relative flex justify-between items-center z-10">
        {/* Connecting Lines */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-surface-variant -z-10 rounded-full overflow-hidden">
          <div className="h-full bg-secondary w-full transition-all duration-700 ease-in-out"></div>
        </div>
        {/* Step 1: Completed */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-[0_0_15px_rgba(33,112,228,0.3)]">
            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Configure</span>
        </div>
        {/* Step 2: Completed */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-[0_0_15px_rgba(33,112,228,0.3)]">
            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Input Data</span>
        </div>
        {/* Step 3: Active */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface border-2 border-secondary flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary absolute animate-ping opacity-75"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-secondary relative z-10"></div>
          </div>
          <span className="font-label-sm text-label-sm text-secondary font-bold">Results</span>
        </div>
      </div>
      {/* Dashboard Header: Composite Quality Score */}
      <div className="w-full max-w-4xl bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-[24px] shadow-[0_4px_20px_rgba(15,23,42,0.05)] p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t-4 border-t-secondary">
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-4">Assessment Complete</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            {scoreNum >= 80
              ? "Your configuration has been processed. The overall composite quality indicates a strong foundation that meets enterprise standards."
              : scoreNum >= 50
              ? "Your configuration has been processed. The overall composite quality is acceptable, but specific architectural dimensions require attention to reach optimal enterprise standards."
              : "Your configuration has been processed. The overall composite quality is below acceptable standards. Critical architectural dimensions require immediate attention."}
          </p>
        </div>
        {/* Circular Gauge */}
        <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
          {/* SVG Ring Chart */}
          <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(33,112,228,0.2)]" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle cx="50" cy="50" fill="none" r="40" stroke="#e0e3e5" strokeLinecap="round" strokeWidth="8"></circle>
            {/* Progress Ring (78%) */}
            <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="40" stroke="#2170e4" strokeDasharray="251.2" strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="8"></circle>
          </svg>
          {/* Inner Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display-lg text-display-lg text-primary tracking-tighter">{scoreNum}<span className="text-2xl">%</span></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Composite</span>
          </div>
        </div>
      </div>
      {/* Bento Grid: Analytics & Insights */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Analytics Breakdown */}
        <div className="bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.05)] p-6 md:p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-secondary">bar_chart</span>
            <h3 className="font-headline-md text-headline-md text-on-background">Quality Characteristics</h3>
          </div>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {result?.characteristic_scores && result.characteristic_scores.map((cs: any) => (
                <div className="space-y-2" key={cs.characteristic_id}>
                  <div className="flex justify-between font-label-md text-label-md">
                    <span className="text-on-background capitalize">{cs.characteristic_name}</span>
                    <span className="text-on-surface-variant">{Math.round(cs.raw_score * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.round(cs.raw_score * 100)}%` }}></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {/* Insights & Recommendations */}
        <div className="bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.05)] p-6 md:p-8 flex flex-col h-full relative overflow-hidden group">
          {/* Glassmorphic highlight */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-tertiary-fixed/40 rounded-full blur-[40px] group-hover:bg-tertiary-fixed/60 transition-colors duration-500"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <span className="material-symbols-outlined text-secondary">lightbulb</span>
            <h3 className="font-headline-md text-headline-md text-on-background">Insights &amp; Actions</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 relative z-10">
            {result?.recommendations && result.recommendations.length > 0
              ? "Based on the analysis, we recommend prioritizing the following architectural interventions:"
              : "Based on the analysis, your architecture is sound and no specific interventions are required at this time."}
          </p>
          <ul className="space-y-4 relative z-10 flex-1 overflow-y-auto max-h-[300px]">
            {result?.recommendations?.map((rec: any, idx: number) => (
              <li key={idx} className="flex items-start gap-3 bg-surface-container-lowest/50 p-3 rounded-lg border border-outline-variant/20 hover:border-secondary/30 transition-colors">
                <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">lightbulb</span>
                <span className="font-body-md text-body-md text-on-background">{rec.action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Action Footer */}
      <div className="w-full max-w-4xl flex justify-end gap-4 mt-8 pt-8 border-t border-outline-variant/30">
        <button onClick={onStartOver} className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-highest transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          Start Over
        </button>
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg bg-surface-container-lowest border border-secondary text-secondary font-label-md text-label-md hover:bg-secondary/5 transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Modify Data
        </button>
        <button className="px-6 py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-container hover:shadow-md transition-all duration-200 flex items-center gap-2">
          Export Report
          <span className="material-symbols-outlined text-[18px]">download</span>
        </button>
      </div>
    </div>
  );
}
