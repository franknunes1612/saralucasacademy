import { cn } from "@/lib/utils";

interface SpotScoreMeterProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

// Short, punchy labels - no "rare" or "common"
function getSpotLabel(score: number): string {
  if (score >= 85) return "Legendary";
  if (score >= 70) return "Epic Find";
  if (score >= 50) return "Nice Catch";
  if (score >= 30) return "Solid Spot";
  return "Spotted";
}

// Tier-based colors for the neon theme
function getScoreTier(score: number): "low" | "mid" | "high" {
  if (score >= 70) return "high";
  if (score >= 30) return "mid";
  return "low";
}

function getTierColorClass(tier: "low" | "mid" | "high"): string {
  switch (tier) {
    case "high": return "spot-high";
    case "mid": return "spot-mid";
    case "low": return "spot-low";
  }
}

function getTierGradient(tier: "low" | "mid" | "high"): string {
  switch (tier) {
    case "high":
      return "conic-gradient(from 180deg, hsl(280 80% 65%) 0%, hsl(320 100% 65%) 100%)";
    case "mid":
      return "conic-gradient(from 180deg, hsl(185 100% 50%) 0%, hsl(220 100% 60%) 100%)";
    case "low":
      return "conic-gradient(from 180deg, hsl(220 20% 40%) 0%, hsl(220 20% 55%) 100%)";
  }
}

export function SpotScoreMeter({ score, size = "lg", animated = true }: SpotScoreMeterProps) {
  if (score === null) return null;

  const tier = getScoreTier(score);
  const label = getSpotLabel(score);
  const colorClass = getTierColorClass(tier);
  const progress = score / 100;

  // Size configurations
  const sizeConfig = {
    sm: { ring: 80, stroke: 6, fontSize: "text-2xl", labelSize: "text-xs" },
    md: { ring: 120, stroke: 8, fontSize: "text-4xl", labelSize: "text-sm" },
    lg: { ring: 160, stroke: 10, fontSize: "text-5xl", labelSize: "text-base" },
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
        {/* Glow effect for high scores */}
        {tier === "high" && (
          <div
            className="absolute inset-0 rounded-full animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, hsl(280 80% 65% / 0.2) 0%, transparent 70%)",
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
            <linearGradient id={`scoreGradient-${tier}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {tier === "high" && (
                <>
                  <stop offset="0%" stopColor="hsl(280 80% 65%)" />
                  <stop offset="100%" stopColor="hsl(320 100% 65%)" />
                </>
              )}
              {tier === "mid" && (
                <>
                  <stop offset="0%" stopColor="hsl(185 100% 50%)" />
                  <stop offset="100%" stopColor="hsl(220 100% 60%)" />
                </>
              )}
              {tier === "low" && (
                <>
                  <stop offset="0%" stopColor="hsl(220 20% 45%)" />
                  <stop offset="100%" stopColor="hsl(220 20% 55%)" />
                </>
              )}
            </linearGradient>
          </defs>
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke={`url(#scoreGradient-${tier})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animated ? "stroke-dashoffset 0.8s ease-out" : "none",
              filter: tier !== "low" ? `drop-shadow(0 0 6px hsl(${tier === "high" ? "280 80% 65%" : "185 100% 50%"} / 0.5))` : "none",
            }}
          />
        </svg>

        {/* Score number */}
        <div className="relative z-10 text-center">
          <span className={cn("font-bold", config.fontSize, colorClass)}>
            {score}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className={cn("font-semibold uppercase tracking-wider", config.labelSize, colorClass)}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Spot Score</p>
      </div>
    </div>
  );
}
