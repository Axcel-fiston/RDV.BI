import React from 'react';
import { LanguageProvider, useLanguage } from './components/LanguageContext';

function LanguageOverlay() {
  const { isSwitching, pendingLang } = useLanguage();

  if (!isSwitching) {
    return null;
  }

  const loadingLabel = pendingLang === 'fr' ? 'Passage en francais...' : 'Switching to English...';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f8f1ea]/65 backdrop-blur-xl">
      <div
        className="flex min-w-[260px] flex-col items-center rounded-[2rem] px-8 py-8 text-center shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,248,242,0.72))',
          boxShadow: '0 24px 60px rgba(92,69,46,0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
          border: '1px solid rgba(255,255,255,0.75)',
        }}
      >
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border border-[#d9b98a]/40" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#b91c1c] border-r-[#d4af6a]" />
          <div className="absolute inset-[10px] rounded-full bg-white/50" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6d53]">
          RDV.BI
        </p>
        <p className="mt-2 text-base font-medium text-[#3d2b20]">
          {loadingLabel}
        </p>
      </div>
    </div>
  );
}

function LayoutContent({ children }) {
  return (
    <>
      {children}
      <LanguageOverlay />
    </>
  );
}

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <LayoutContent>{children}</LayoutContent>
    </LanguageProvider>
  );
}
