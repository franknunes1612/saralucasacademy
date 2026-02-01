import { Link } from "react-router-dom";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Minimal footer with copyright notice
 * All content controlled via CMS (footer.copyright.*)
 */
export function Footer() {
  const cms = useCmsContent();
  const { language } = useLanguage();

  // Check if footer is enabled via CMS
  const isEnabled = cms.get("footer.copyright.enabled", { pt: "true", en: "true" }) === "true";
  const showLinks = cms.get("footer.copyright.showLinks", { pt: "true", en: "true" }) === "true";

  if (!isEnabled) return null;

  // Get copyright text and replace {year} with current year
  const currentYear = new Date().getFullYear();
  const copyrightTemplate = cms.get("footer.copyright.text", {
    pt: "Sara Lucas © {year}",
    en: "Sara Lucas © {year}",
  });
  const copyrightText = copyrightTemplate.replace("{year}", String(currentYear));

  return (
    <footer className="w-full py-4 px-4 border-t border-white/5 bg-background/50 backdrop-blur-sm">
      <div className="max-w-lg mx-auto flex flex-col items-center gap-2">
        {/* Copyright text */}
        <p className="text-xs text-white/40 font-light tracking-wide">
          {copyrightText}
        </p>

        {/* Optional links */}
        {showLinks && (
          <div className="flex items-center gap-4">
            <Link
              to="/terms"
              className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
            >
              {language === "pt" ? "Termos de Uso" : "Terms of Use"}
            </Link>
            <span className="text-white/20">•</span>
            <Link
              to="/support"
              className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
            >
              {language === "pt" ? "Suporte" : "Support"}
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
}
