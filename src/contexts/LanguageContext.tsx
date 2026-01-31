import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type SupportedLanguage = "pt" | "en";

interface LanguageContextType {
  language: SupportedLanguage;
  isPortuguese: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (translations: { pt: string; en: string }) => string;
}

const LANGUAGE_STORAGE_KEY = "sara-lucas-language";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): SupportedLanguage {
  // Check localStorage first
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "pt" || stored === "en") {
      return stored;
    }
  }
  
  // Fall back to browser language detection
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language || (navigator as any).userLanguage || "en";
    const langCode = browserLang.toLowerCase().split("-")[0];
    return langCode === "pt" ? "pt" : "en";
  }
  
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  const isPortuguese = language === "pt";

  const t = useCallback(
    (translations: { pt: string; en: string }): string => {
      return translations[language];
    },
    [language]
  );

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "pt" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, isPortuguese, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within a LanguageProvider");
  }
  return context;
}
