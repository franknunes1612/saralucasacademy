import { Clock, Plus } from "lucide-react";
import { Recipe } from "@/data/recipes";
import { useLanguage } from "@/hooks/useLanguage";
import { useSavedMeals } from "@/hooks/useSavedMeals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  compact?: boolean;
}

export function RecipeCard({ recipe, compact = false }: RecipeCardProps) {
  const { language, t } = useLanguage();
  const { saveMeal } = useSavedMeals();

  const handleAddToMeals = async () => {
    const saved = await saveMeal({
      items: [{ 
        name: recipe.name[language], 
        portion: "medium", 
        estimatedCalories: recipe.calories 
      }],
      totalCalories: recipe.calories,
      confidenceScore: 95,
      macros: recipe.macros,
      source: "camera",
    });

    if (saved) {
      toast.success(t({ pt: "Adicionado às refeições", en: "Added to meals" }));
    } else {
      toast.error(t({ pt: "Erro ao guardar", en: "Could not save" }));
    }
  };

  const categoryColors = {
    light: "bg-success/20 text-success",
    balanced: "bg-primary/20 text-primary",
    rich: "bg-secondary/20 text-secondary",
  };

  const categoryLabels = {
    light: { pt: "Leve", en: "Light" },
    balanced: { pt: "Equilibrado", en: "Balanced" },
    rich: { pt: "Rico", en: "Rich" },
  };

  if (compact) {
    return (
      <div className="result-card p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
          {recipe.imageEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{recipe.name[language]}</p>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>~{recipe.calories} kcal</span>
            <span>•</span>
            <span>P {recipe.macros.protein}g</span>
          </div>
        </div>
        <button
          onClick={handleAddToMeals}
          className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors shrink-0"
          aria-label={t({ pt: "Adicionar", en: "Add" })}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="result-card overflow-hidden">
      {/* Header with emoji and category */}
      <div className="p-4 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
            {recipe.imageEmoji}
          </div>
          <div>
            <h3 className="font-semibold text-white">{recipe.name[language]}</h3>
            <p className="text-xs text-white/60 mt-0.5">{recipe.description[language]}</p>
          </div>
        </div>
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", categoryColors[recipe.category])}>
          {categoryLabels[recipe.category][language]}
        </span>
      </div>

      {/* Nutrition info */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-white">~{recipe.calories}</p>
            <p className="text-xs text-white/50">kcal</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center flex-1">
            <p className="text-sm font-semibold macro-protein">{recipe.macros.protein}g</p>
            <p className="text-xs text-white/50">{t({ pt: "Proteína", en: "Protein" })}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center flex-1">
            <p className="text-sm font-semibold macro-carbs">{recipe.macros.carbs}g</p>
            <p className="text-xs text-white/50">{t({ pt: "Carbos", en: "Carbs" })}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center flex-1">
            <p className="text-sm font-semibold macro-fat">{recipe.macros.fat}g</p>
            <p className="text-xs text-white/50">{t({ pt: "Gordura", en: "Fat" })}</p>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{recipe.prepTime} min</span>
        </div>
        <span>{recipe.portion[language]}</span>
      </div>

      {/* Add button */}
      <div className="p-4 pt-2">
        <button
          onClick={handleAddToMeals}
          className="w-full py-3 btn-secondary rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t({ pt: "Adicionar às Refeições", en: "Add to My Meals" })}
        </button>
      </div>
    </div>
  );
}
