import { useState } from "react";
import { ArrowLeft, ChefHat, Flame, Scale, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { recipes, getRecipesByCategory, Recipe } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";

import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

type Category = "all" | "light" | "balanced" | "rich";

export default function FitRecipes() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const categories: { id: Category; label: { pt: string; en: string }; icon: React.ElementType; color: string }[] = [
    { id: "all", label: { pt: "Todas", en: "All" }, icon: ChefHat, color: "text-white" },
    { id: "light", label: { pt: "Leves", en: "Light" }, icon: Zap, color: "text-success" },
    { id: "balanced", label: { pt: "Equilibradas", en: "Balanced" }, icon: Scale, color: "text-primary" },
    { id: "rich", label: { pt: "Ricas", en: "Rich" }, icon: Flame, color: "text-secondary" },
  ];

  const filteredRecipes = selectedCategory === "all" 
    ? recipes 
    : getRecipesByCategory(selectedCategory);

  const getCategoryDescription = () => {
    switch (selectedCategory) {
      case "light":
        return t({ pt: "Menos de 400 kcal", en: "Under 400 kcal" });
      case "balanced":
        return t({ pt: "400–650 kcal", en: "400–650 kcal" });
      case "rich":
        return t({ pt: "650–850 kcal", en: "650–850 kcal" });
      default:
        return t({ pt: "Todas as receitas saudáveis", en: "All healthy recipes" });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t({ pt: "Receitas Fit", en: "Fit Recipes" })}
          </h1>
          <p className="text-xs text-white/60">{getCategoryDescription()}</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all",
                isActive 
                  ? "bg-white text-primary" 
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary" : cat.color)} />
              {cat.label[t({ pt: "pt", en: "en" }) as "pt" | "en"]}
            </button>
          );
        })}
      </div>

      {/* Recipe grid */}
      <div className="space-y-4 mb-8">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="glass-card p-4 text-center mb-6">
        <p className="text-xs text-white/60">
          {t({
            pt: "Valores estimados. Podem variar conforme ingredientes e preparação.",
            en: "Estimated values. May vary by ingredients and preparation.",
          })}
        </p>
      </div>

      {/* Personalized guidance hint */}
      <p className="text-xs text-white/50 text-center mb-4">
        {t({
          pt: "Toque no botão de chat para falar com um nutricionista",
          en: "Tap the chat button for personalized nutrition advice",
        })}
      </p>
    </div>
  );
}
