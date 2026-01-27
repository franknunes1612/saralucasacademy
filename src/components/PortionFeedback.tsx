import { useState } from "react";
import { Minus, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeNumber } from "@/lib/nutritionUtils";

interface PortionFeedbackProps {
  originalCalories: number;
  onAdjust: (adjustedCalories: number, adjustment: PortionAdjustment) => void;
}

export type PortionAdjustment = "smaller" | "correct" | "larger";

// ±15% adjustment factors
const ADJUSTMENT_FACTORS: Record<PortionAdjustment, number> = {
  smaller: 0.85,
  correct: 1.0,
  larger: 1.15,
};

export function PortionFeedback({ originalCalories, onAdjust }: PortionFeedbackProps) {
  const [selected, setSelected] = useState<PortionAdjustment | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (adjustment: PortionAdjustment) => {
    if (confirmed) return;
    
    setSelected(adjustment);
    const factor = ADJUSTMENT_FACTORS[adjustment];
    const safeOriginal = safeNumber(originalCalories, 0);
    const adjustedCalories = Math.round(safeOriginal * factor / 10) * 10;
    
    setTimeout(() => {
      setConfirmed(true);
      onAdjust(adjustedCalories, adjustment);
    }, 100);
  };

  if (confirmed) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 animate-fade-in">
        <Check className="h-4 w-4 text-white" />
        <span className="text-sm text-white/70">
          {selected === "correct" ? "Thanks!" : "Estimate adjusted"}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      <p className="text-sm text-center text-white">
        Was the portion about right?
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => handleSelect("smaller")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all text-white",
            "bg-white/15 hover:bg-white/25 border border-transparent",
            selected === "smaller" && "border-white bg-white/25"
          )}
        >
          <Minus className="h-4 w-4" />
          <span>Smaller</span>
        </button>
        <button
          onClick={() => handleSelect("correct")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all text-white",
            "bg-white/15 hover:bg-white/25 border border-transparent",
            selected === "correct" && "border-white bg-white/25"
          )}
        >
          <Check className="h-4 w-4" />
          <span>About right</span>
        </button>
        <button
          onClick={() => handleSelect("larger")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all text-white",
            "bg-white/15 hover:bg-white/25 border border-transparent",
            selected === "larger" && "border-white bg-white/25"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Larger</span>
        </button>
      </div>
    </div>
  );
}
