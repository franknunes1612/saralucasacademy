import { cn } from "@/lib/utils";

interface FoodItem {
  name: string;
  portion: "small" | "medium" | "large";
  estimatedCalories: number | null;
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

export function FoodItemsList({ items }: FoodItemsListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
        Detected Items
      </p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 glass-card rounded-xl"
          >
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
                  {item.estimatedCalories}
                </p>
                <p className="text-xs text-muted-foreground">cal</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
