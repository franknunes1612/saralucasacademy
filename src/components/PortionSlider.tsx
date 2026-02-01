import { useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { safeNumber } from "@/lib/nutritionUtils";

interface PortionSliderProps {
  /** Base estimated grams from visual analysis */
  baseGrams: number;
  /** Base calories to scale */
  baseCalories: number;
  /** Base macros to scale */
  baseMacros: { protein: number; carbs: number; fat: number } | null;
  /** Callback when portion is adjusted */
  onAdjust: (adjusted: {
    grams: number;
    calories: number;
    macros: { protein: number; carbs: number; fat: number } | null;
    multiplier: number;
  }) => void;
  /** Low confidence - show slider more prominently */
  lowConfidence?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
  className?: string;
}

// Slider range: -30% to +40% (0.7 to 1.4)
const MIN_MULTIPLIER = 0.7;
const MAX_MULTIPLIER = 1.4;
const DEFAULT_MULTIPLIER = 1.0;

// Convert slider value (0-100) to multiplier
const sliderToMultiplier = (value: number): number => {
  return MIN_MULTIPLIER + (value / 100) * (MAX_MULTIPLIER - MIN_MULTIPLIER);
};

// Convert multiplier to slider value (0-100)
const multiplierToSlider = (mult: number): number => {
  return Math.round(((mult - MIN_MULTIPLIER) / (MAX_MULTIPLIER - MIN_MULTIPLIER)) * 100);
};

export function PortionSlider({
  baseGrams,
  baseCalories,
  baseMacros,
  onAdjust,
  lowConfidence = false,
  compact = false,
  className,
}: PortionSliderProps) {
  const [sliderValue, setSliderValue] = useState(() => multiplierToSlider(DEFAULT_MULTIPLIER));
  const [hasInteracted, setHasInteracted] = useState(false);

  const safeBaseGrams = safeNumber(baseGrams, 150);
  const safeBaseCalories = safeNumber(baseCalories, 0);

  // Calculate current values based on slider
  const multiplier = sliderToMultiplier(sliderValue);
  const currentGrams = Math.round(safeBaseGrams * multiplier);
  const currentCalories = Math.round(safeBaseCalories * multiplier);
  
  const currentMacros = baseMacros ? {
    protein: Math.round(safeNumber(baseMacros.protein, 0) * multiplier),
    carbs: Math.round(safeNumber(baseMacros.carbs, 0) * multiplier),
    fat: Math.round(safeNumber(baseMacros.fat, 0) * multiplier),
  } : null;

  // Notify parent of adjustments
  useEffect(() => {
    if (hasInteracted) {
      onAdjust({
        grams: currentGrams,
        calories: currentCalories,
        macros: currentMacros,
        multiplier,
      });
    }
  }, [currentGrams, currentCalories, currentMacros, multiplier, hasInteracted, onAdjust]);

  const handleSliderChange = useCallback((values: number[]) => {
    setHasInteracted(true);
    setSliderValue(values[0]);
  }, []);

  // Reset when base values change (new scan)
  useEffect(() => {
    setSliderValue(multiplierToSlider(DEFAULT_MULTIPLIER));
    setHasInteracted(false);
  }, [baseGrams, baseCalories]);

  // Format percentage change for display
  const percentChange = Math.round((multiplier - 1) * 100);
  const percentDisplay = percentChange === 0 
    ? "" 
    : percentChange > 0 
      ? `+${percentChange}%` 
      : `${percentChange}%`;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Gram estimate display */}
      <div className="text-center">
        <p className="text-sm text-white/80">
          Estimated portion:{" "}
          <span className={cn(
            "font-semibold transition-colors",
            hasInteracted ? "text-primary" : "text-white"
          )}>
            ~{currentGrams} g
          </span>
          {percentDisplay && (
            <span className="ml-2 text-xs text-primary">
              {percentDisplay}
            </span>
          )}
        </p>
        {!compact && (
          <p className="text-xs text-white/50 mt-1">
            Macros shown for this estimated portion
          </p>
        )}
      </div>

      {/* Slider */}
      <div className={cn(
        "px-2",
        lowConfidence && "bg-white/5 rounded-xl p-4"
      )}>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 w-8">-30%</span>
          <Slider
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="text-xs text-white/70 w-8">+40%</span>
        </div>
        
        {/* Helper text */}
        <p className="text-xs text-white/70 text-center mt-2">
          {lowConfidence 
            ? "Portion size has a big impact here. Adjust if needed."
            : "Adjust if the portion looks different to you."
          }
        </p>
      </div>

      {/* Live calorie update indicator */}
      {hasInteracted && (
        <div className="text-center animate-fade-in">
          <p className="text-xs text-primary">
            Calories updated to ~{currentCalories} kcal
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact gram display for when slider is not needed
 * Shows estimated grams with visual estimate indicator
 */
interface GramEstimateProps {
  grams: number;
  portionLabel?: string;
  className?: string;
}

export function GramEstimate({ grams, portionLabel = "medium", className }: GramEstimateProps) {
  const safeGrams = safeNumber(grams, 0);
  
  if (safeGrams <= 0) return null;
  
  return (
    <div className={cn("text-center", className)}>
      <p className="text-sm text-white/80">
        Estimated portion:{" "}
        <span className="font-semibold text-white">~{Math.round(safeGrams)} g</span>
      </p>
      {portionLabel && (
        <p className="text-xs text-white/50 mt-0.5">
          {portionLabel.charAt(0).toUpperCase() + portionLabel.slice(1)} portion (visual estimate)
        </p>
      )}
    </div>
  );
}
