import { Droplets } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ZeroCalorieBadgeProps {
  showSubtitle?: boolean;
  compact?: boolean;
}

export function ZeroCalorieBadge({ showSubtitle = false, compact = false }: ZeroCalorieBadgeProps) {
  const { t } = useLanguage();

  const subtitle = t({
    en: "Non-caloric beverage",
    pt: "Bebida sem calorias",
  });

  const description = t({
    en: "Does not contribute to daily calorie intake",
    pt: "Não contribui para a ingestão calórica diária",
  });

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: "hsl(340 50% 92%)",
          border: "1px solid hsl(340 40% 78%)",
          color: "hsl(340 40% 35%)",
        }}
      >
        <Droplets className="h-3 w-3" style={{ opacity: 0.8 }} />
        0 kcal
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Main badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold"
        style={{
          backgroundColor: "hsl(340 50% 92%)",
          border: "1px solid hsl(340 40% 78%)",
          color: "hsl(340 40% 35%)",
        }}
      >
        <Droplets className="h-4 w-4" style={{ opacity: 0.8 }} />
        <span className="text-base">0 kcal</span>
      </div>

      {/* Subtitle */}
      {showSubtitle && (
        <div className="text-center">
          <p className="text-sm font-medium text-white/90">{subtitle}</p>
          <p className="text-xs text-white/60 mt-0.5">{description}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Zero macros display for zero-calorie items
 */
export function ZeroMacrosBadge() {
  return (
    <div className="flex items-center justify-center gap-4 py-3 px-4 bg-white/10 rounded-xl">
      <span className="text-sm" style={{ color: "hsl(210 70% 82%)" }}>
        P 0g
      </span>
      <span className="text-white/30">•</span>
      <span className="text-sm" style={{ color: "hsl(25 80% 80%)" }}>
        C 0g
      </span>
      <span className="text-white/30">•</span>
      <span className="text-sm" style={{ color: "hsl(275 60% 82%)" }}>
        F 0g
      </span>
    </div>
  );
}
