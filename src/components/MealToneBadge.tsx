import { cn } from "@/lib/utils";
import { safeNumber } from "@/lib/nutritionUtils";

interface MealToneBadgeProps {
  calories: number;
  compact?: boolean;
}

type MealTone = "light" | "balanced" | "rich";

interface ToneConfig {
  label: string;
  description: string;
  className: string;
  icon: string;
}

const TONE_CONFIG: Record<MealTone, ToneConfig> = {
  light: {
    label: "Light",
    description: "Low calorie density • Fruits, vegetables, light snacks",
    className: "bg-success/15 text-success border-success/25",
    icon: "🥗",
  },
  balanced: {
    label: "Balanced",
    description: "Complete meal • Carbs + protein + fat",
    className: "bg-primary/15 text-primary border-primary/25",
    icon: "🍽️",
  },
  rich: {
    label: "Rich",
    description: "High calorie density • Fried foods, sauces, large portions",
    className: "bg-secondary/20 text-secondary border-secondary/30",
    icon: "🍔",
  },
};

/**
 * Determine meal tone based on calorie content
 * Light: < 300 kcal
 * Balanced: 300-600 kcal
 * Rich: > 600 kcal
 */
function getMealTone(calories: number): MealTone {
  const safe = safeNumber(calories, 0);
  if (safe >= 600) return "rich";
  if (safe >= 300) return "balanced";
  return "light";
}

export function MealToneBadge({ calories, compact = false }: MealToneBadgeProps) {
  const tone = getMealTone(calories);
  const config = TONE_CONFIG[tone];

  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.className
      )}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <div className={cn(
      "inline-flex flex-col items-center gap-1 px-4 py-2 rounded-xl border",
      config.className
    )}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <span className="font-semibold">{config.label}</span>
      </div>
      <p className="text-xs opacity-80 text-center">{config.description}</p>
    </div>
  );
}

export { getMealTone, type MealTone };
