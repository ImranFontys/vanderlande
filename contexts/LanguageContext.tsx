"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { defaultLanguage, passengerLanguages, type Language } from "@/lib/i18n/passenger";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  languages: readonly Language[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: passengerLanguages,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
