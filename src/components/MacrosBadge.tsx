import { MacroInfoTooltip } from "./MacroInfoTooltip";

interface MacrosBadgeProps {
  macros: { protein: number; carbs: number; fat: number } | null;
  showInfoIcon?: boolean;
  showDescription?: boolean;
  compact?: boolean;
}

function formatMacroValue(value: number): string {
  // Remove leading zeros and format properly
  const rounded = Math.round(value * 10) / 10;
  return String(rounded);
}

export function MacrosBadge({ 
  macros, 
  showInfoIcon = true, 
  showDescription = true,
  compact = false 
}: MacrosBadgeProps) {
  if (!macros) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="macro-protein font-medium">
          P {formatMacroValue(macros.protein)}g
        </span>
        <span className="macro-carbs font-medium">
          C {formatMacroValue(macros.carbs)}g
        </span>
        <span className="macro-fat font-medium">
          F {formatMacroValue(macros.fat)}g
        </span>
      </div>
    );
  }

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
          <p className="text-lg font-semibold macro-protein">{formatMacroValue(macros.protein)}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold macro-carbs">{formatMacroValue(macros.carbs)}g</p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold macro-fat">{formatMacroValue(macros.fat)}g</p>
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
