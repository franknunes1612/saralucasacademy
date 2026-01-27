import { useMemo } from "react";

type SupportedLanguage = "pt" | "en";

interface UseLanguageReturn {
  language: SupportedLanguage;
  isPortuguese: boolean;
  t: (translations: { pt: string; en: string }) => string;
}

export function useLanguage(): UseLanguageReturn {
  const language = useMemo<SupportedLanguage>(() => {
    // Check browser language
    const browserLang = navigator.language || (navigator as any).userLanguage || "en";
    const langCode = browserLang.toLowerCase().split("-")[0];
    
    // Return Portuguese if detected, otherwise English
    return langCode === "pt" ? "pt" : "en";
  }, []);

  const isPortuguese = language === "pt";

  const t = (translations: { pt: string; en: string }): string => {
    return translations[language];
  };

  return {
    language,
    isPortuguese,
    t,
  };
}
