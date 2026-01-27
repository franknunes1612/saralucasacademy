import { ChefHat, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Recipe, getSuggestedRecipes } from "@/data/recipes";
import { RecipeCard } from "./RecipeCard";
import { useLanguage } from "@/hooks/useLanguage";

interface RecipeSuggestionsProps {
  mealTone: "light" | "balanced" | "rich";
}

export function RecipeSuggestions({ mealTone }: RecipeSuggestionsProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const suggestions = getSuggestedRecipes(mealTone, 2);

  const getContextMessage = () => {
    if (mealTone === "rich") {
      return t({
        pt: "Quer equilibrar o dia? Estas receitas leves combinam bem.",
        en: "Want to balance your day? These light recipes fit well.",
      });
    }
    if (mealTone === "light") {
      return t({
        pt: "Precisa de mais energia? Experimente estas opções.",
        en: "Need more energy? Try these balanced options.",
      });
    }
    return t({
      pt: "Mais ideias para as suas refeições",
      en: "More ideas for your meals",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-white text-sm">
            {t({ pt: "Receitas Sugeridas", en: "Suggested Recipes" })}
          </h3>
        </div>
        <button
          onClick={() => navigate("/recipes")}
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          {t({ pt: "Ver todas", en: "See all" })}
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Context message */}
      <p className="text-xs text-white/60">{getContextMessage()}</p>

      {/* Compact recipe cards */}
      <div className="space-y-2">
        {suggestions.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} compact />
        ))}
      </div>
    </div>
  );
}
