import { safeNumber, formatMacroSafe } from "@/lib/nutritionUtils";

interface FoodItem {
  name: string;
  portion: "small" | "medium" | "large";
  estimatedCalories: number | null;
  macros?: { protein: number; carbs: number; fat: number } | null;
}

interface FoodItemsListProps {
  items: FoodItem[];
}

function getPortionIcon(portion: "small" | "medium" | "large" | undefined): string {
  switch (portion) {
    case "small": return "🥄";
    case "medium": return "🍽️";
    case "large": return "🍲";
    default: return "🍽️"; // Default to medium icon
  }
}

function getPortionLabel(portion: "small" | "medium" | "large" | undefined): string {
  switch (portion) {
    case "small": return "Small";
    case "medium": return "Medium";
    case "large": return "Large";
    default: return "Medium"; // Default to medium label
  }
}

function formatCalories(calories: number | null | undefined): string {
  if (calories === null || calories === undefined) return "—";
  const safe = safeNumber(calories, 0);
  if (safe === 0) return "—";
  return `~${Math.round(safe)}`;
}

function formatMacroValue(value: number | undefined): string {
  return formatMacroSafe(value);
}

export function FoodItemsList({ items }: FoodItemsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60 uppercase tracking-wide mb-3">
        What we found
      </p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-white/10 rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getPortionIcon(item.portion)}</span>
                <div>
                  <p className="font-medium text-sm text-white">{item.name}</p>
                  <p className="text-xs text-white/60">
                    {getPortionLabel(item.portion)} portion
                  </p>
                </div>
              </div>
              {item.estimatedCalories !== null && (
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {formatCalories(item.estimatedCalories)}
                  </p>
                  <p className="text-xs text-white/60">kcal</p>
                </div>
              )}
            </div>
            
            {/* Macros per item if available */}
            {item.macros && (
              <div className="flex gap-3 pt-1 pl-9 text-xs">
                <span style={{ color: 'hsl(210 70% 82%)' }}>
                  P {formatMacroValue(item.macros.protein)}g
                </span>
                <span style={{ color: 'hsl(25 80% 80%)' }}>
                  C {formatMacroValue(item.macros.carbs)}g
                </span>
                <span style={{ color: 'hsl(275 60% 82%)' }}>
                  F {formatMacroValue(item.macros.fat)}g
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
