import { SavedMeal } from "@/hooks/useSavedMeals";
import { MacrosBadge } from "./MacrosBadge";
import { MealToneBadge } from "./MealToneBadge";
import { safeNumber, getCalorieValue, hasValidCalories, ensureMacros } from "@/lib/nutritionUtils";

interface SavedMealCardProps {
  meal: SavedMeal;
  onTap: () => void;
}

// For pink-first design, calories are all white
function getCalorieClass(calories: number | { min: number; max: number } | null): string {
  return "text-white";
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
      <div className="aspect-square rounded-xl bg-white/10 mb-3 flex items-center justify-center overflow-hidden border border-white/10">
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
      <p className="font-medium text-sm text-white truncate mb-1">
        {displayName}
        {hasMore && <span className="text-white/60"> +{meal.items.length - 2}</span>}
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
          {formatCalories(meal.totalCalories)} <span className="text-xs font-normal text-white/60">kcal</span>
        </div>
      )}

      {/* Compact macro breakdown - always show if calories exist, infer if needed */}
      {hasValidCalories(meal.totalCalories) && (
        <div className="mt-2 pt-2 border-t border-white/15">
          <MacrosBadge macros={ensureMacros(meal.macros, meal.totalCalories)} compact showInfoIcon={false} showDescription={false} />
        </div>
      )}
    </div>
  );
}
