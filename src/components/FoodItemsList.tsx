interface FoodItem {
  name: string;
  portion: "small" | "medium" | "large";
  estimatedCalories: number | null;
  macros?: { protein: number; carbs: number; fat: number } | null;
}

interface FoodItemsListProps {
  items: FoodItem[];
}

function getPortionIcon(portion: "small" | "medium" | "large"): string {
  switch (portion) {
    case "small": return "🥄";
    case "medium": return "🍽️";
    case "large": return "🍲";
  }
}

function getPortionLabel(portion: "small" | "medium" | "large"): string {
  switch (portion) {
    case "small": return "Small";
    case "medium": return "Medium";
    case "large": return "Large";
  }
}

function formatCalories(calories: number | null): string {
  if (calories === null) return "—";
  return `~${Math.round(calories)}`;
}

function formatMacroValue(value: number): string {
  return String(Math.round(value * 10) / 10);
}

export function FoodItemsList({ items }: FoodItemsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
        What we found
      </p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 glass-card rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getPortionIcon(item.portion)}</span>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getPortionLabel(item.portion)} portion
                  </p>
                </div>
              </div>
              {item.estimatedCalories !== null && (
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {formatCalories(item.estimatedCalories)}
                  </p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
              )}
            </div>
            
            {/* Macros per item if available */}
            {item.macros && (
              <div className="flex gap-3 pt-1 pl-9 text-xs">
                <span className="macro-protein">
                  P {formatMacroValue(item.macros.protein)}g
                </span>
                <span className="macro-carbs">
                  C {formatMacroValue(item.macros.carbs)}g
                </span>
                <span className="macro-fat">
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
