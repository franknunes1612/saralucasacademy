import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedMeals, SavedMeal, FoodItem } from "@/hooks/useSavedMeals";
import { useCalorieGoal } from "@/hooks/useCalorieGoal";
import { useMealReminders } from "@/hooks/useMealReminders";
import { SavedMealCard } from "@/components/SavedMealCard";
import { CalorieMeter } from "@/components/CalorieMeter";
import { CalorieGoalProgress } from "@/components/CalorieGoalProgress";
import { CalorieGoalEditor } from "@/components/CalorieGoalEditor";
import { MealRemindersSettings } from "@/components/MealRemindersSettings";
import { FoodItemsList } from "@/components/FoodItemsList";
import { MacrosBadge } from "@/components/MacrosBadge";
import { MealToneBadge } from "@/components/MealToneBadge";
import { ArrowLeft, Trash2, Camera, Bell, BellOff, HelpCircle } from "lucide-react";
import { safeNumber, getCalorieValue } from "@/lib/nutritionUtils";

function calculateTotalCalories(meals: SavedMeal[]): number {
  let total = 0;
  for (const meal of meals) {
    const cal = getCalorieValue(meal.totalCalories);
    total += safeNumber(cal, 0);
  }
  return Math.round(total);
}

export default function MyMeals() {
  const navigate = useNavigate();
  const { meals, deleteMeal, clearAllMeals, storageError, isLoading, isSupported, reloadMeals } = useSavedMeals();
  const { goal, setGoal } = useCalorieGoal();
  const { settings: reminderSettings } = useMealReminders();
  const [selectedMeal, setSelectedMeal] = useState<SavedMeal | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [showRemindersSettings, setShowRemindersSettings] = useState(false);

  useEffect(() => {
    reloadMeals();
  }, [reloadMeals]);

  const totalCalories = useMemo(() => calculateTotalCalories(meals), [meals]);
  
  // Filter meals to only include today's meals for goal tracking
  const todaysMeals = useMemo(() => {
    const today = new Date().toDateString();
    return meals.filter(meal => new Date(meal.timestamp).toDateString() === today);
  }, [meals]);
  
  const todaysCalories = useMemo(() => calculateTotalCalories(todaysMeals), [todaysMeals]);

  const handleBack = () => {
    if (selectedMeal) {
      setSelectedMeal(null);
    } else {
      navigate("/");
    }
  };

  const handleClearAll = async () => {
    await clearAllMeals();
    setShowClearConfirm(false);
  };

  const formatCalories = (cal: number | { min: number; max: number } | null): string => {
    if (cal === null) return "—";
    if (typeof cal === "object") return `${Math.round(cal.min)}-${Math.round(cal.max)}`;
    return String(Math.round(cal));
  };

  // Detail view
  if (selectedMeal) {
    const displayName = selectedMeal.items.length > 0 
      ? selectedMeal.items.map(i => i.name).join(", ")
      : "Unknown meal";
    
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Meal Details</h1>
        </div>

        <div className="result-card p-6 text-center space-y-6">
          {/* Meal image or food icon */}
          {selectedMeal.imageData ? (
            <div className="mx-auto w-32 h-32 rounded-2xl overflow-hidden soft-border">
              <img 
                src={`data:image/jpeg;base64,${selectedMeal.imageData}`}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="text-5xl">🍽️</div>
          )}

          {/* Meal name */}
          <h2 className="text-xl font-bold">{displayName}</h2>

          {/* Meal tone badge */}
          {getCalorieValue(selectedMeal.totalCalories) > 0 && (
            <div className="flex justify-center">
              <MealToneBadge calories={getCalorieValue(selectedMeal.totalCalories)} />
            </div>
          )}

          {/* Calorie meter */}
          <div className="flex justify-center">
            <CalorieMeter calories={selectedMeal.totalCalories} size="md" animated={false} />
          </div>

          {/* Macros if available */}
          {selectedMeal.macros && (
            <MacrosBadge macros={selectedMeal.macros} />
          )}

          {/* Food items list */}
          <FoodItemsList items={selectedMeal.items} />

          {/* Timestamp */}
          <p className="text-sm text-muted-foreground">
            {new Date(selectedMeal.timestamp).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground/60 pt-2 border-t border-border/30">
            Visual estimate based on a single image. May vary depending on portion and preparation.
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={async () => {
            await deleteMeal(selectedMeal.id);
            setSelectedMeal(null);
          }}
          className="w-full mt-5 py-4 glass-card rounded-xl text-destructive flex items-center justify-center gap-2 font-medium transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    );
  }

  // Collection list view
  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">My Meals</h1>
        </div>
        
        <div className="flex items-center gap-1">
          {/* How it works */}
          <button
            onClick={() => navigate("/how-it-works")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="How it works"
          >
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Reminders button */}
          <button
            onClick={() => setShowRemindersSettings(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Meal Reminders"
          >
            {reminderSettings.enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          
          {/* Clear button */}
          {meals.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Daily Goal Progress */}
      {isSupported && (
        <CalorieGoalProgress
          currentCalories={todaysCalories}
          goalCalories={goal}
          onEditGoal={() => setShowGoalEditor(true)}
        />
      )}

      {/* Today's Summary */}
      {todaysMeals.length > 0 && (
        <div className="result-card p-5 mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Today</p>
          <div className="text-3xl font-bold calorie-mid">{todaysCalories} <span className="text-lg font-normal text-muted-foreground">kcal</span></div>
          <p className="text-sm text-muted-foreground mt-1">
            {todaysMeals.length} meal{todaysMeals.length === 1 ? "" : "s"} logged
          </p>
        </div>
      )}

      {/* Not supported */}
      {!isSupported && (
        <div className="glass-card p-4 rounded-xl mb-5">
          <p className="text-sm text-warning text-center">Storage not supported</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && isSupported && (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )}

      {/* Storage error */}
      {storageError && isSupported && (
        <div className="glass-card p-4 rounded-xl mb-5">
          <p className="text-sm text-warning text-center">{storageError}</p>
        </div>
      )}

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="glass-card p-5 rounded-xl mb-5 animate-fade-in">
          <p className="text-sm mb-4 text-center">Delete all meals?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 py-3 btn-secondary rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && isSupported && meals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-lg font-medium mb-2">No meals yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Scan your food to track calories
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Scan Food
          </button>
        </div>
      ) : !isLoading && isSupported ? (
        /* Grid of meals */
        <div className="grid grid-cols-2 gap-3">
          {meals.map((meal) => (
            <SavedMealCard
              key={meal.id}
              meal={meal}
              onTap={() => setSelectedMeal(meal)}
            />
          ))}
        </div>
      ) : null}

      {/* Privacy footer */}
      {isSupported && meals.length > 0 && (
        <p className="text-xs text-muted-foreground/50 mt-6 text-center">
          All data saved locally on your device
        </p>
      )}

      {/* Goal Editor Modal */}
      {showGoalEditor && (
        <CalorieGoalEditor
          currentGoal={goal}
          onSave={setGoal}
          onClose={() => setShowGoalEditor(false)}
        />
      )}

      {/* Reminders Settings Modal */}
      {showRemindersSettings && (
        <MealRemindersSettings
          onClose={() => setShowRemindersSettings(false)}
        />
      )}
    </div>
  );
}
