import { cn } from "@/lib/utils";

interface CalorieMeterProps {
  calories: number | { min: number; max: number } | null;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

function getCalorieLabel(calories: number): string {
  if (calories >= 800) return "Heavy Meal";
  if (calories >= 500) return "Full Meal";
  if (calories >= 300) return "Light Meal";
  if (calories >= 150) return "Snack";
  return "Light Bite";
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

  return (
    <div className={cn("flex flex-col items-center gap-3", animated && "animate-score-reveal")}>
      {/* Circular meter */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.ring, height: config.ring }}
      >
        {/* Glow effect for high calories */}
        {tier === "high" && (
          <div
            className="absolute inset-0 rounded-full animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, hsl(25 100% 50% / 0.2) 0%, transparent 70%)",
            }}
          />
        )}

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
            stroke="hsl(230 15% 20%)"
            strokeWidth={config.stroke}
          />
          {/* Progress ring with gradient */}
          <defs>
            <linearGradient id={`calorieGradient-${tier}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {tier === "high" && (
                <>
                  <stop offset="0%" stopColor="hsl(25 100% 50%)" />
                  <stop offset="100%" stopColor="hsl(0 85% 55%)" />
                </>
              )}
              {tier === "mid" && (
                <>
                  <stop offset="0%" stopColor="hsl(45 100% 50%)" />
                  <stop offset="100%" stopColor="hsl(25 100% 50%)" />
                </>
              )}
              {tier === "low" && (
                <>
                  <stop offset="0%" stopColor="hsl(150 60% 45%)" />
                  <stop offset="100%" stopColor="hsl(185 100% 50%)" />
                </>
              )}
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
              filter: tier !== "low" ? `drop-shadow(0 0 6px hsl(${tier === "high" ? "25 100% 50%" : "45 100% 50%"} / 0.5))` : "none",
            }}
          />
        </svg>

        {/* Calorie number */}
        <div className="relative z-10 text-center">
          {isRange ? (
            <span className={cn("font-bold", config.fontSize, colorClass)}>
              {calories.min}-{calories.max}
            </span>
          ) : (
            <span className={cn("font-bold", config.fontSize, colorClass)}>
              {displayCalories}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={cn("font-semibold uppercase tracking-wider", config.labelSize, colorClass)}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isRange ? "Est. Calories" : "Calories"}
        </p>
      </div>
    </div>
  );
}
