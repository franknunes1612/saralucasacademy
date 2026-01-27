import { SavedMeal } from "@/hooks/useSavedMeals";
import { MacrosBadge } from "./MacrosBadge";

interface SavedMealCardProps {
  meal: SavedMeal;
  onTap: () => void;
}

function getCalorieClass(calories: number | { min: number; max: number } | null): string {
  if (calories === null) return "";
  const cal = typeof calories === "object" ? (calories.min + calories.max) / 2 : calories;
  if (cal >= 600) return "calorie-high";
  if (cal >= 300) return "calorie-mid";
  return "calorie-low";
}

function formatCalories(calories: number | { min: number; max: number } | null): string {
  if (calories === null) return "—";
  if (typeof calories === "object") {
    return `~${Math.round(calories.min)}-${Math.round(calories.max)}`;
  }
  return `~${Math.round(calories)}`;
}

export function SavedMealCard({ meal, onTap }: SavedMealCardProps) {
  const displayName = meal.items.length > 0 
    ? meal.items.map(i => i.name).slice(0, 2).join(", ")
    : "Unknown meal";
  
  const hasMore = meal.items.length > 2;

  return (
    <div 
      className="glass-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onTap}
    >
      {/* Food icon placeholder */}
      <div className="aspect-square rounded-xl bg-secondary/60 mb-3 flex items-center justify-center overflow-hidden">
        <div className="text-3xl">🍽️</div>
      </div>

      {/* Meal name - truncated */}
      <p className="font-medium text-sm text-foreground truncate mb-1">
        {displayName}
        {hasMore && <span className="text-muted-foreground"> +{meal.items.length - 2}</span>}
      </p>

      {/* Calorie display */}
      {meal.totalCalories !== null && (
        <div className={`text-lg font-bold ${getCalorieClass(meal.totalCalories)}`}>
          {formatCalories(meal.totalCalories)} <span className="text-xs font-normal text-muted-foreground">kcal</span>
        </div>
      )}

      {/* Compact macro breakdown */}
      {meal.macros && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <MacrosBadge macros={meal.macros} compact showInfoIcon={false} showDescription={false} />
        </div>
      )}
    </div>
  );
}
