import { MacroInfoTooltip } from "./MacroInfoTooltip";
import { safeNumber, formatMacroSafe, sanitizeMacros } from "@/lib/nutritionUtils";

interface MacrosBadgeProps {
  macros: { protein?: number; carbs?: number; fat?: number } | null;
  showInfoIcon?: boolean;
  showDescription?: boolean;
  compact?: boolean;
}

function formatMacroValue(value: number | undefined): string {
  const safe = safeNumber(value, 0);
  // Round to 1 decimal for cleaner display
  return String(Math.round(safe));
}

/**
 * Check if macros have any meaningful values
 */
function hasValidMacros(macros: { protein?: number; carbs?: number; fat?: number } | null): boolean {
  if (!macros) return false;
  const p = safeNumber(macros.protein, 0);
  const c = safeNumber(macros.carbs, 0);
  const f = safeNumber(macros.fat, 0);
  return p > 0 || c > 0 || f > 0;
}

export function MacrosBadge({ 
  macros, 
  showInfoIcon = true, 
  showDescription = true,
  compact = false 
}: MacrosBadgeProps) {
  // Handle null/undefined macros - show zeros instead of nothing
  const safeMacros = macros ? {
    protein: safeNumber(macros.protein, 0),
    carbs: safeNumber(macros.carbs, 0),
    fat: safeNumber(macros.fat, 0),
  } : null;

  // If completely null and we're not in compact mode, hide entirely
  if (!safeMacros && !compact) return null;

  // For compact mode with no macros, show zeros
  const displayMacros = safeMacros || { protein: 0, carbs: 0, fat: 0 };

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="macro-protein font-medium">
          P {formatMacroValue(displayMacros.protein)}g
        </span>
        <span className="macro-carbs font-medium">
          C {formatMacroValue(displayMacros.carbs)}g
        </span>
        <span className="macro-fat font-medium">
          F {formatMacroValue(displayMacros.fat)}g
        </span>
      </div>
    );
  }

  // Full mode - only show if we have valid macros
  if (!hasValidMacros(displayMacros)) return null;

  return (
    <div className="space-y-3">
      {/* Header with info icon */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-xs text-muted-foreground">
          Macros
        </span>
        {showInfoIcon && <MacroInfoTooltip />}
      </div>
      
      {/* Macro values */}
      <div className="flex gap-5 justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold macro-protein">{formatMacroValue(displayMacros.protein)}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold macro-carbs">{formatMacroValue(displayMacros.carbs)}g</p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold macro-fat">{formatMacroValue(displayMacros.fat)}g</p>
          <p className="text-xs text-muted-foreground">Fat</p>
        </div>
      </div>

      {/* Educational description */}
      {showDescription && (
        <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
          Protein helps muscle repair • Carbs provide energy • Fat supports hormones
        </p>
      )}
    </div>
  );
}
