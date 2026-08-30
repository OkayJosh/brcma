import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  currentStep: number;
}

export function Layout({ children, currentStep }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* TopAppBar */}
      <header className="bg-surface/70 dark:bg-surface-dim/70 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm transition-all duration-200 flex justify-between items-center px-gutter h-16 w-full z-50 fixed top-0 w-full">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed">settings_input_component</span>
          <h1 className="text-secondary dark:text-secondary-fixed font-headline-md text-headline-md font-bold tracking-tight">Assessment Engine</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-outline-variant/30">
            <img alt="User profile" className="w-full h-full object-cover" data-alt="A small, professional portrait photograph of a user avatar, featuring a neutral expression and clean background, fitting for a corporate software interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmngorHtcxXT71R9eTTPBvYsirotTSKQEeZrbxvFe_LLYLx1vbF1lirGJFVYNZT0_StJzdAVjonVfCq6qL1C9ZtA_ht7tapgpHwwEBROaylnbmVY8K_LVs9F97HwNi3zzyf8C7mCNpFJiuHMs2_LPEGrrITXPwYAEWiuQYeGglKsW5-QqdKo0lOBADf2PCaJ3RgLdB1IpWRqagz7P9r1DxuCf3eS3GC5Z9EUnfn3DRCSwaJqakQLtZ-oW8EbVdjJQFZ9oAWpiUpSxe"/>
          </div>
        </div>
      </header>

      <div className="flex pt-16 h-screen overflow-hidden">
        {/* NavigationDrawer (Hidden on Mobile) */}
        <aside className="bg-surface-container-low dark:bg-tertiary-container h-full w-72 border-r border-outline-variant/30 hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] z-40 transition-all duration-200 ease-in-out">
          <div className="p-6">
            <h2 className="font-headline-md text-headline-md text-primary mb-6 font-bold tracking-tight">EIDF Wizard</h2>
            <nav className="flex flex-col gap-2">
              <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 group ${currentStep === 1 ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`} href="#">
                <span className={`material-symbols-outlined ${currentStep === 1 ? '' : 'group-hover:text-secondary'}`} style={{ fontVariationSettings: currentStep === 1 ? '"FILL" 1' : '"FILL" 0' }}>settings</span>
                <span className={currentStep === 1 ? 'font-semibold' : ''}>Configure</span>
              </a>
              <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 group ${currentStep === 2 ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`} href="#">
                <span className={`material-symbols-outlined ${currentStep === 2 ? '' : 'group-hover:text-secondary'}`} style={{ fontVariationSettings: currentStep === 2 ? '"FILL" 1' : '"FILL" 0' }}>database</span>
                <span className={currentStep === 2 ? 'font-semibold' : ''}>Input Data</span>
              </a>
              <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors duration-200 group ${currentStep === 3 ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`} href="#">
                <span className={`material-symbols-outlined ${currentStep === 3 ? '' : 'group-hover:text-secondary'}`} style={{ fontVariationSettings: currentStep === 3 ? '"FILL" 1' : '"FILL" 0' }}>analytics</span>
                <span className={currentStep === 3 ? 'font-semibold' : ''}>Results</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 overflow-y-auto relative w-full h-full">
          {children}
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="bg-surface/80 dark:bg-surface-container-lowest/80 backdrop-blur-md rounded-t-xl border-t border-outline-variant/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-4">
        <a className={`flex flex-col items-center justify-center rounded-full px-4 py-1 font-label-sm text-label-sm active:scale-95 transition-transform duration-300 w-16 gap-1 ${currentStep === 1 ? 'bg-secondary text-on-secondary shadow-md' : 'text-outline'}`} href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: currentStep === 1 ? '"FILL" 1' : '"FILL" 0' }}>settings</span>
          <span>Configure</span>
        </a>
        <a className={`flex flex-col items-center justify-center rounded-full px-4 py-1 font-label-sm text-label-sm active:scale-95 transition-transform duration-300 w-16 gap-1 ${currentStep === 2 ? 'bg-secondary text-on-secondary shadow-md' : 'text-outline'}`} href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: currentStep === 2 ? '"FILL" 1' : '"FILL" 0' }}>database</span>
          <span>Input</span>
        </a>
        <a className={`flex flex-col items-center justify-center rounded-full px-4 py-1 font-label-sm text-label-sm active:scale-95 transition-transform duration-300 min-w-[72px] gap-1 ${currentStep === 3 ? 'bg-secondary text-on-secondary shadow-md' : 'text-outline'}`} href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: currentStep === 3 ? '"FILL" 1' : '"FILL" 0' }}>analytics</span>
          <span>Results</span>
        </a>
      </nav>
    </div>
  );
}
