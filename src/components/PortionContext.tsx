import { safeNumber } from "@/lib/nutritionUtils";
import { cn } from "@/lib/utils";

interface PortionContextProps {
  estimatedGrams?: number | null;
  portionLabel?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Displays the estimated portion context with grams and portion size
 * Shows "Estimated portion: ~180g" or "Based on medium portion"
 */
export function PortionContext({ 
  estimatedGrams, 
  portionLabel = "medium",
  className,
  compact = false
}: PortionContextProps) {
  const grams = safeNumber(estimatedGrams, 0);
  
  // Format portion label for display
  const formattedPortion = portionLabel.charAt(0).toUpperCase() + portionLabel.slice(1);
  
  if (compact) {
    return (
      <div className={cn("text-xs text-white/60 text-center", className)}>
        {grams > 0 ? (
          <span>~{Math.round(grams)}g • {formattedPortion} portion</span>
        ) : (
          <span>{formattedPortion} portion (estimated)</span>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("text-center space-y-1", className)}>
      {grams > 0 ? (
        <>
          <p className="text-sm text-white/80">
            Estimated portion: <span className="font-medium">~{Math.round(grams)}g</span>
          </p>
          <p className="text-xs text-white/50">
            Macros shown for this estimated portion
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-white/80">
            Based on {formattedPortion.toLowerCase()} portion
          </p>
          <p className="text-xs text-white/50">
            Visual estimate from image analysis
          </p>
        </>
      )}
    </div>
  );
}

interface UnitReferenceProps {
  perUnit?: { label: string; grams?: number };
  per100g?: boolean;
  className?: string;
}

/**
 * Shows reference basis for packaged/unit-based foods
 * "Per 1 cookie (~12g)" or "Per 100g (reference)"
 */
export function UnitReference({ perUnit, per100g, className }: UnitReferenceProps) {
  if (!perUnit && !per100g) return null;
  
  return (
    <div className={cn("flex flex-wrap gap-2 justify-center text-xs", className)}>
      {perUnit && (
        <span className="px-2 py-1 rounded-full bg-white/10 text-white/70">
          Per {perUnit.label}
          {perUnit.grams && ` (~${perUnit.grams}g)`}
        </span>
      )}
      {per100g && (
        <span className="px-2 py-1 rounded-full bg-white/10 text-white/70">
          Per 100g (reference)
        </span>
      )}
    </div>
  );
}
