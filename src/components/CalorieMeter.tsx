import { cn } from "@/lib/utils";

interface CalorieMeterProps {
  calories: number | { min: number; max: number } | null;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

function getCalorieLabel(calories: number): string {
  if (calories >= 800) return "Rich meal";
  if (calories >= 600) return "Hearty meal";
  if (calories >= 300) return "Balanced meal";
  if (calories >= 150) return "Light meal";
  return "Light bite";
}

function formatCalorieDisplay(value: number, showEstimate: boolean = true): string {
  const rounded = Math.round(value);
  return showEstimate ? `~${rounded}` : String(rounded);
}

function getCalorieTier(calories: number): "low" | "mid" | "high" {
  if (calories >= 600) return "high";
  if (calories >= 300) return "mid";
  return "low";
}

function getTierColorClass(tier: "low" | "mid" | "high"): string {
  switch (tier) {
    case "high": return "calorie-high";
    case "mid": return "calorie-mid";
    case "low": return "calorie-low";
  }
}

export function CalorieMeter({ calories, size = "lg", animated = true }: CalorieMeterProps) {
  if (calories === null) return null;

  const isRange = typeof calories === "object";
  const displayCalories = isRange ? Math.round((calories.min + calories.max) / 2) : calories;
  const tier = getCalorieTier(displayCalories);
  const label = getCalorieLabel(displayCalories);
  const colorClass = getTierColorClass(tier);
  
  // Progress based on 1000 cal max for visual
  const progress = Math.min(displayCalories / 1000, 1);

  const sizeConfig = {
    sm: { ring: 80, stroke: 6, fontSize: "text-xl", labelSize: "text-xs" },
    md: { ring: 120, stroke: 8, fontSize: "text-3xl", labelSize: "text-sm" },
    lg: { ring: 160, stroke: 10, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Softer gradient colors
  const gradientColors = {
    high: { start: "hsl(15 75% 55%)", end: "hsl(0 65% 52%)" },
    mid: { start: "hsl(38 85% 52%)", end: "hsl(25 80% 50%)" },
    low: { start: "hsl(152 55% 48%)", end: "hsl(172 50% 45%)" },
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
          {/* Background ring */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke="hsl(220 15% 22%)"
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
        <p className={cn("font-medium", config.labelSize, colorClass)}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          est. kcal
        </p>
      </div>
    </div>
  );
}
