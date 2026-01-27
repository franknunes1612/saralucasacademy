import { MacroInfoTooltip } from "./MacroInfoTooltip";

interface MacrosBadgeProps {
  macros: { protein: number; carbs: number; fat: number } | null;
  showInfoIcon?: boolean;
}

function formatMacroValue(value: number): string {
  // Remove leading zeros and format properly
  return Number(value.toFixed(1)).toString();
}

export function MacrosBadge({ macros, showInfoIcon = true }: MacrosBadgeProps) {
  if (!macros) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Macronutrientes
        </span>
        {showInfoIcon && <MacroInfoTooltip />}
      </div>
      
      <div className="flex gap-4 justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-blue-400">{formatMacroValue(macros.protein)}g</p>
          <p className="text-xs text-muted-foreground">Proteína</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-amber-400">{formatMacroValue(macros.carbs)}g</p>
          <p className="text-xs text-muted-foreground">Carboidratos</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-rose-400">{formatMacroValue(macros.fat)}g</p>
          <p className="text-xs text-muted-foreground">Gordura</p>
        </div>
      </div>
    </div>
  );
}
