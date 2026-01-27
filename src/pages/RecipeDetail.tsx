import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Plus, Bookmark } from "lucide-react";
import { recipes as staticRecipes } from "@/data/recipes";
import { useRecipes, Recipe } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import { useSavedMeals } from "@/hooks/useSavedMeals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RecipeDetail() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { saveMeal } = useSavedMeals();
  const { recipes: dbRecipes, isLoading, getRecipeById } = useRecipes();

  // Try to find recipe in DB first, then fall back to static recipes
  const dbRecipe = getRecipeById(recipeId || "");
  const staticRecipe = staticRecipes.find((r) => r.id === recipeId);
  
  // Normalize static recipe to match DB recipe interface
  const recipe: Recipe | undefined = dbRecipe || (staticRecipe ? {
    ...staticRecipe,
    imageUrl: null,
    steps: { pt: [], en: [] },
  } : undefined);

  if (isLoading && !recipe) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom flex items-center justify-center">
        <div className="animate-pulse text-white/60">
          {t({ pt: "A carregar...", en: "Loading..." })}
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom flex flex-col items-center justify-center">
        <p className="text-white/60 mb-4">
          {t({ pt: "Receita não encontrada", en: "Recipe not found" })}
        </p>
        <button
          onClick={() => navigate("/recipes")}
          className="btn-primary px-6 py-3 rounded-xl"
        >
          {t({ pt: "Ver todas as receitas", en: "View all recipes" })}
        </button>
      </div>
    );
  }

  const handleAddToMeals = async () => {
    const saved = await saveMeal({
      items: [
        {
          name: recipe.name[language],
          portion: "medium",
          estimatedCalories: recipe.calories,
        },
      ],
      totalCalories: recipe.calories,
      confidenceScore: 95,
      macros: recipe.macros,
      source: "camera",
    });

    if (saved) {
      toast.success(t({ pt: "Adicionado às refeições", en: "Added to meals" }), {
        duration: 2000,
      });
    } else {
      toast.error(t({ pt: "Erro ao guardar", en: "Could not save" }));
    }
  };

  const handleSaveRecipe = () => {
    toast.success(
      t({ pt: "Receita guardada nos favoritos", en: "Recipe saved to favorites" }),
      { duration: 2000 }
    );
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

  // Use stored steps or generate default ones
  const getPreparationSteps = () => {
    if (recipe.steps && recipe.steps[language].length > 0) {
      return recipe.steps[language];
    }
    
    // Default steps for static recipes
    const ingredientsList = recipe.ingredients[language].join(", ");
    const steps = {
      pt: [
        `Prepare todos os ingredientes: ${ingredientsList}.`,
        "Lave e corte os ingredientes frescos conforme necessário.",
        "Cozinhe os ingredientes principais seguindo o método adequado.",
        "Tempere a gosto e ajuste os sabores.",
        "Sirva imediatamente para melhor sabor e textura.",
      ],
      en: [
        `Prepare all ingredients: ${ingredientsList}.`,
        "Wash and cut fresh ingredients as needed.",
        "Cook main ingredients following the appropriate method.",
        "Season to taste and adjust flavors.",
        "Serve immediately for best flavor and texture.",
      ],
    };
    return steps[language];
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom animate-fade-in">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label={t({ pt: "Voltar", en: "Go back" })}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white truncate flex-1">
          {recipe.name[language]}
        </h1>
        <button
          onClick={handleSaveRecipe}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label={t({ pt: "Guardar receita", en: "Save recipe" })}
        >
          <Bookmark className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Recipe hero */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-5xl overflow-hidden">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.name[language]}
                className="w-full h-full object-cover"
              />
            ) : (
              recipe.imageEmoji
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  categoryColors[recipe.category]
                )}
              >
                {categoryLabels[recipe.category][language]}
              </span>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <Clock className="h-3.5 w-3.5" />
                <span>{recipe.prepTime} min</span>
              </div>
            </div>
            <p className="text-sm text-white/70">{recipe.description[language]}</p>
            <p className="text-xs text-white/50 mt-1">{recipe.portion[language]}</p>
          </div>
        </div>
      </div>

      {/* Nutrition card */}
      <div className="px-4 mb-6">
        <div className="result-card p-4">
          <h2 className="text-sm font-semibold text-white mb-3">
            {t({ pt: "Informação Nutricional", en: "Nutrition Information" })}
          </h2>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-white">~{recipe.calories}</p>
              <p className="text-xs text-white/50">kcal</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center flex-1">
              <p className="text-lg font-semibold macro-protein">
                {recipe.macros.protein}g
              </p>
              <p className="text-xs text-white/50">
                {t({ pt: "Proteína", en: "Protein" })}
              </p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center flex-1">
              <p className="text-lg font-semibold macro-carbs">
                {recipe.macros.carbs}g
              </p>
              <p className="text-xs text-white/50">
                {t({ pt: "Carbos", en: "Carbs" })}
              </p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center flex-1">
              <p className="text-lg font-semibold macro-fat">{recipe.macros.fat}g</p>
              <p className="text-xs text-white/50">
                {t({ pt: "Gordura", en: "Fat" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">
          {t({ pt: "Ingredientes", en: "Ingredients" })}
        </h2>
        <div className="result-card p-4">
          <ul className="space-y-2">
            {recipe.ingredients[language].map((ingredient, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-white/80">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preparation steps */}
      <div className="px-4 mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">
          {t({ pt: "Preparação", en: "Preparation" })}
        </h2>
        <div className="result-card p-4">
          <ol className="space-y-4">
            {getPreparationSteps().map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="text-sm text-white/80 flex-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 mb-6">
        <p className="text-xs text-white/50 text-center">
          {t({
            pt: "Valores estimados. Podem variar conforme ingredientes e preparação.",
            en: "Estimated values. May vary by ingredients and preparation.",
          })}
        </p>
      </div>

      {/* Bottom action button */}
      <div className="sticky bottom-0 px-4 py-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleAddToMeals}
          className="w-full py-4 btn-primary rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          {t({ pt: "Adicionar às Refeições", en: "Add to My Meals" })}
        </button>
      </div>
    </div>
  );
}
