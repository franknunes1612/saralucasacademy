import { useState, useCallback, useEffect, useMemo } from "react";

type SupportedLanguage = "pt" | "en";

const LANGUAGE_STORAGE_KEY = "sara-lucas-language";

interface UseLanguageReturn {
  language: SupportedLanguage;
  isPortuguese: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (translations: { pt: string; en: string }) => string;
}

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

// Global state for language (simple approach without context)
let globalLanguage: SupportedLanguage = getInitialLanguage();
const listeners = new Set<(lang: SupportedLanguage) => void>();

function setGlobalLanguage(lang: SupportedLanguage) {
  globalLanguage = lang;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  listeners.forEach((listener) => listener(lang));
}

export function useLanguage(): UseLanguageReturn {
  const [language, setLanguageState] = useState<SupportedLanguage>(globalLanguage);

  useEffect(() => {
    const listener = (lang: SupportedLanguage) => setLanguageState(lang);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setGlobalLanguage(lang);
  }, []);

  const isPortuguese = language === "pt";

  const t = useCallback(
    (translations: { pt: string; en: string }): string => {
      return translations[language];
    },
    [language]
  );

  return {
    language,
    isPortuguese,
    setLanguage,
    t,
  };
}
