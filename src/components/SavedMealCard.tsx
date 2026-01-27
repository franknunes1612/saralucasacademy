import { SavedMeal } from "@/hooks/useSavedMeals";
import { MacrosBadge } from "./MacrosBadge";
import { MealToneBadge } from "./MealToneBadge";
import { safeNumber, getCalorieValue, hasValidCalories } from "@/lib/nutritionUtils";

interface SavedMealCardProps {
  meal: SavedMeal;
  onTap: () => void;
}

function getCalorieClass(calories: number | { min: number; max: number } | null): string {
  if (!hasValidCalories(calories)) return "";
  const cal = getCalorieValue(calories);
  if (cal >= 600) return "calorie-high";
  if (cal >= 300) return "calorie-mid";
  return "calorie-low";
}

function formatCalories(calories: number | { min: number; max: number } | null): string {
  if (!hasValidCalories(calories)) return "—";
  
  if (typeof calories === "object" && calories !== null) {
    const min = safeNumber(calories.min, 0);
    const max = safeNumber(calories.max, 0);
    if (min === 0 && max === 0) return "—";
    return `~${Math.round(min)}-${Math.round(max)}`;
  }
  
  const num = safeNumber(calories, 0);
  if (num === 0) return "—";
  return `~${Math.round(num)}`;
}

export function SavedMealCard({ meal, onTap }: SavedMealCardProps) {
  const displayName = meal.items.length > 0 
    ? meal.items.map(i => i.name).slice(0, 2).join(", ")
    : "Unknown meal";
  
  const hasMore = meal.items.length > 2;
  const calorieValue = getCalorieValue(meal.totalCalories);

  return (
    <div 
      className="glass-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onTap}
    >
      {/* Meal image or fallback */}
      <div className="aspect-square rounded-xl bg-secondary/60 mb-3 flex items-center justify-center overflow-hidden">
        {meal.imageData ? (
          <img 
            src={`data:image/jpeg;base64,${meal.imageData}`}
            alt={displayName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-3xl">🍽️</div>
        )}
      </div>

      {/* Meal name - truncated */}
      <p className="font-medium text-sm text-foreground truncate mb-1">
        {displayName}
        {hasMore && <span className="text-muted-foreground"> +{meal.items.length - 2}</span>}
      </p>

      {/* Meal tone badge */}
      {hasValidCalories(meal.totalCalories) && (
        <div className="mb-1">
          <MealToneBadge calories={calorieValue} compact />
        </div>
      )}

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
