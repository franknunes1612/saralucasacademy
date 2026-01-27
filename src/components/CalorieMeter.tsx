import { cn } from "@/lib/utils";
import { safeNumber, getCalorieValue, hasValidCalories } from "@/lib/nutritionUtils";

interface CalorieMeterProps {
  calories: number | { min: number; max: number } | null;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

function getCalorieLabel(calories: number): string {
  const safe = safeNumber(calories, 0);
  if (safe >= 800) return "Rich meal";
  if (safe >= 600) return "Hearty meal";
  if (safe >= 300) return "Balanced meal";
  if (safe >= 150) return "Light meal";
  if (safe > 0) return "Light bite";
  return "Estimate unavailable";
}

function formatCalorieDisplay(value: number, showEstimate: boolean = true): string {
  const rounded = Math.round(safeNumber(value, 0));
  if (rounded === 0) return "—";
  return showEstimate ? `~${rounded}` : String(rounded);
}

function getCalorieTier(calories: number): "low" | "mid" | "high" {
  const safe = safeNumber(calories, 0);
  if (safe >= 600) return "high";
  if (safe >= 300) return "mid";
  return "low";
}

// For pink-first design, all calorie text is white
function getTierColorClass(tier: "low" | "mid" | "high"): string {
  return "text-white";
}

export function CalorieMeter({ calories, size = "lg", animated = true }: CalorieMeterProps) {
  // Early return for invalid data
  if (!hasValidCalories(calories)) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">—</p>
          <p className="text-sm text-muted-foreground mt-1">Estimate unavailable</p>
        </div>
      </div>
    );
  }

  const isRange = typeof calories === "object";
  const displayCalories = getCalorieValue(calories);
  const tier = getCalorieTier(displayCalories);
  const label = getCalorieLabel(displayCalories);
  const colorClass = getTierColorClass(tier);
  
  // Progress based on 1000 cal max for visual
  const progress = Math.min(safeNumber(displayCalories, 0) / 1000, 1);

  const sizeConfig = {
    sm: { ring: 80, stroke: 6, fontSize: "text-xl", labelSize: "text-xs" },
    md: { ring: 120, stroke: 8, fontSize: "text-3xl", labelSize: "text-sm" },
    lg: { ring: 160, stroke: 10, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // White-based gradient colors for pink background
  const gradientColors = {
    high: { start: "hsl(335 35% 58%)", end: "hsl(340 30% 50%)" },
    mid: { start: "hsl(0 0% 100%)", end: "hsl(340 55% 88%)" },
    low: { start: "hsl(155 45% 55%)", end: "hsl(160 40% 48%)" },
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", animated && "animate-score-reveal")}>
      {/* Circular meter */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.ring, height: config.ring }}
      >
        {/* SVG Ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.ring}
          height={config.ring}
          viewBox={`0 0 ${config.ring} ${config.ring}`}
        >
          {/* Background ring - soft pink */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke="hsl(340 35% 65%)"
            strokeWidth={config.stroke}
          />
          {/* Progress ring with gradient */}
          <defs>
            <linearGradient id={`calorieGradient-${tier}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors[tier].start} />
              <stop offset="100%" stopColor={gradientColors[tier].end} />
            </linearGradient>
          </defs>
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke={`url(#calorieGradient-${tier})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animated ? "stroke-dashoffset 0.8s ease-out" : "none",
            }}
          />
        </svg>

        {/* Calorie number */}
        <div className="relative z-10 text-center">
          {isRange ? (
            <span className={cn("font-bold", config.fontSize, colorClass)}>
              ~{formatCalorieDisplay(calories.min, false)}-{formatCalorieDisplay(calories.max, false)}
            </span>
          ) : (
            <span className={cn("font-bold", config.fontSize, colorClass)}>
              {formatCalorieDisplay(displayCalories)}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={cn("font-medium text-white", config.labelSize)}>
          {label}
        </p>
        <p className="text-xs text-white/70 mt-0.5">
          est. kcal
        </p>
      </div>
    </div>
  );
}
