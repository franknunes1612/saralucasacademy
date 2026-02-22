import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { WHATSAPP_MESSAGES, STORAGE_KEYS, openWhatsApp } from "@/lib/constants";

const TOOLTIPS = {
  pt: "Falar com nutricionista",
  en: "Talk to a nutritionist",
};

interface NutritionistFABProps {
  className?: string;
}

export function NutritionistFAB({ className }: NutritionistFABProps) {
  const { language, t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasShownTooltip, setHasShownTooltip] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.nutritionistTooltipShown) === "true";
  });

  // Show tooltip on first visit only
  useEffect(() => {
    if (!hasShownTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem(STORAGE_KEYS.nutritionistTooltipShown, "true");
          setHasShownTooltip(true);
        }, 3000);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [hasShownTooltip]);

  const handleClick = () => {
    openWhatsApp(WHATSAPP_MESSAGES.appUser, language);
  };

  const tooltipText = t(TOOLTIPS);

  return (
    <div className={cn("fixed bottom-24 right-4 z-40 safe-bottom", className)}>
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 animate-fade-in">
          <div className="bg-card/95 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-white/10">
            {tooltipText}
            {/* Arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="border-8 border-transparent border-l-card/95" />
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={handleClick}
        className="group relative w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg shadow-black/20 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 border border-white/20"
        aria-label={tooltipText}
      >
        <MessageCircle className="h-5 w-5 text-[hsl(var(--primary))]" />
        
        {/* Subtle pulse ring on first appearance */}
        {!hasShownTooltip && (
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
      </button>
    </div>
  );
}
