import { useState } from "react";
import { Minus, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeNumber } from "@/lib/nutritionUtils";

interface PortionAdjusterProps {
  originalCalories: number;
  onAdjust: (adjustedCalories: number, adjustment: PortionAdjustment) => void;
  onDismiss: () => void;
}

export type PortionAdjustment = "smaller" | "correct" | "larger";

const ADJUSTMENT_FACTORS: Record<PortionAdjustment, number> = {
  smaller: 0.85, // -15%
  correct: 1.0,
  larger: 1.15, // +15%
};

export function PortionAdjuster({ 
  originalCalories, 
  onAdjust, 
  onDismiss 
}: PortionAdjusterProps) {
  const [selected, setSelected] = useState<PortionAdjustment | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (adjustment: PortionAdjustment) => {
    if (confirmed) return;
    
    setSelected(adjustment);
    const factor = ADJUSTMENT_FACTORS[adjustment];
    const safeOriginal = safeNumber(originalCalories, 0);
    const adjustedCalories = Math.round(safeOriginal * factor / 10) * 10; // Round to nearest 10
    
    // Auto-confirm after a short delay
    setTimeout(() => {
      setConfirmed(true);
      onAdjust(adjustedCalories, adjustment);
    }, 150);
  };

  if (confirmed) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
        <Check className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">
          {selected === "correct" ? "Got it!" : "Estimate adjusted"}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground text-center">
        Was the portion size about right?
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => handleSelect("smaller")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all",
            "bg-secondary hover:bg-muted border border-transparent",
            selected === "smaller" && "border-primary bg-primary/10"
          )}
        >
          <Minus className="h-3.5 w-3.5" />
          <span>Smaller</span>
        </button>
        <button
          onClick={() => handleSelect("correct")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            "bg-secondary hover:bg-muted border border-transparent",
            selected === "correct" && "border-primary bg-primary/10"
          )}
        >
          <Check className="h-3.5 w-3.5" />
          <span>About right</span>
        </button>
        <button
          onClick={() => handleSelect("larger")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all",
            "bg-secondary hover:bg-muted border border-transparent",
            selected === "larger" && "border-primary bg-primary/10"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Larger</span>
        </button>
      </div>
    </div>
  );
}
