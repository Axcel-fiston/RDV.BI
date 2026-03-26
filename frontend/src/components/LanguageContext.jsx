import React, { createContext, useContext, useState } from 'react';
import { translations } from './i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('rdvbi_lang') || 'fr'; } catch { return 'fr'; }
  });
  const [isSwitching, setIsSwitching] = useState(false);
  const [pendingLang, setPendingLang] = useState(null);

  const switchLang = (newLang) => {
    if (!newLang || newLang === lang || isSwitching) {
      return;
    }

    setPendingLang(newLang);
    setIsSwitching(true);

    window.setTimeout(() => {
      setLang(newLang);
      try { localStorage.setItem('rdvbi_lang', newLang); } catch {}
      setIsSwitching(false);
      setPendingLang(null);
    }, 650);
  };

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t, isSwitching, pendingLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if used outside provider
    return {
      lang: 'fr',
      switchLang: () => {},
      isSwitching: false,
      pendingLang: null,
      t: (key) => translations['fr']?.[key] || translations['en']?.[key] || key
    };
  }
  return ctx;
}
