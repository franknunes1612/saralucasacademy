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
    case "small": return "Pequena";
    case "medium": return "Média";
    case "large": return "Grande";
  }
}

function formatCalories(calories: number | null): string {
  if (calories === null) return "—";
  // Remove leading zeros by converting to number then string
  return String(Math.round(calories));
}

function formatMacroValue(value: number): string {
  return Number(value.toFixed(1)).toString();
}

export function FoodItemsList({ items }: FoodItemsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
        Itens Detetados
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
                    Porção {getPortionLabel(item.portion).toLowerCase()}
                  </p>
                </div>
              </div>
              {item.estimatedCalories !== null && (
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {formatCalories(item.estimatedCalories)}
                  </p>
                  <p className="text-xs text-muted-foreground">cal</p>
                </div>
              )}
            </div>
            
            {/* Macros per item if available */}
            {item.macros && (
              <div className="flex gap-3 pt-1 pl-9 text-xs">
                <span className="text-blue-400">
                  P: {formatMacroValue(item.macros.protein)}g
                </span>
                <span className="text-amber-400">
                  C: {formatMacroValue(item.macros.carbs)}g
                </span>
                <span className="text-rose-400">
                  G: {formatMacroValue(item.macros.fat)}g
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
