import React, { createContext, useContext, useState } from 'react';
import { translations } from './i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('rdvbi_lang') || 'fr'; } catch { return 'fr'; }
  });

  const switchLang = (newLang) => {
    setLang(newLang);
    try { localStorage.setItem('rdvbi_lang', newLang); } catch {}
  };

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
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
      t: (key) => translations['fr']?.[key] || translations['en']?.[key] || key
    };
  }
  return ctx;
}
