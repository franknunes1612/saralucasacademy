import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "./useLanguage";

export interface DbRecipe {
  id: string;
  name_pt: string;
  name_en: string;
  description_pt: string | null;
  description_en: string | null;
  category: "light" | "balanced" | "rich";
  meal_type: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients_pt: string[];
  ingredients_en: string[];
  steps_pt: string[];
  steps_en: string[];
  prep_time: number | null;
  portion_pt: string | null;
  portion_en: string | null;
  image_url: string | null;
  image_emoji: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Transformed recipe matching the existing Recipe interface
export interface Recipe {
  id: string;
  name: { pt: string; en: string };
  description: { pt: string; en: string };
  category: "light" | "balanced" | "rich";
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  portion: { pt: string; en: string };
  prepTime: number;
  imageEmoji: string;
  imageUrl: string | null;
  ingredients: { pt: string[]; en: string[] };
  steps: { pt: string[]; en: string[] };
}

function transformDbRecipe(dbRecipe: DbRecipe): Recipe {
  return {
    id: dbRecipe.id,
    name: { pt: dbRecipe.name_pt, en: dbRecipe.name_en },
    description: {
      pt: dbRecipe.description_pt || "",
      en: dbRecipe.description_en || "",
    },
    category: dbRecipe.category,
    calories: dbRecipe.calories,
    macros: {
      protein: dbRecipe.protein,
      carbs: dbRecipe.carbs,
      fat: dbRecipe.fat,
    },
    portion: {
      pt: dbRecipe.portion_pt || "1 porção",
      en: dbRecipe.portion_en || "1 serving",
    },
    prepTime: dbRecipe.prep_time || 15,
    imageEmoji: dbRecipe.image_emoji || "🍽️",
    imageUrl: dbRecipe.image_url,
    ingredients: {
      pt: dbRecipe.ingredients_pt || [],
      en: dbRecipe.ingredients_en || [],
    },
    steps: {
      pt: dbRecipe.steps_pt || [],
      en: dbRecipe.steps_en || [],
    },
  };
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("recipes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const transformed = ((data || []) as DbRecipe[]).map(transformDbRecipe);
      setRecipes(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recipes");
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const getRecipesByCategory = useCallback(
    (category: "light" | "balanced" | "rich") => {
      return recipes.filter((r) => r.category === category);
    },
    [recipes]
  );

  const getRecipeById = useCallback(
    (id: string) => {
      return recipes.find((r) => r.id === id);
    },
    [recipes]
  );

  const getSuggestedRecipes = useCallback(
    (mealTone: "light" | "balanced" | "rich", limit: number = 3): Recipe[] => {
      let targetCategory: "light" | "balanced" | "rich";

      if (mealTone === "rich") {
        targetCategory = "light";
      } else if (mealTone === "light") {
        targetCategory = "balanced";
      } else {
        // For balanced meals, suggest a mix
        const lightRecipes = getRecipesByCategory("light").slice(0, 2);
        const richRecipes = getRecipesByCategory("rich").slice(0, 1);
        return [...lightRecipes, ...richRecipes].slice(0, limit);
      }

      return getRecipesByCategory(targetCategory).slice(0, limit);
    },
    [getRecipesByCategory]
  );

  return {
    recipes,
    isLoading,
    error,
    refetch: fetchRecipes,
    getRecipesByCategory,
    getRecipeById,
    getSuggestedRecipes,
  };
}

// Admin hook with full CRUD operations
export function useAdminRecipes() {
  const [recipes, setRecipes] = useState<DbRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setRecipes((data || []) as DbRecipe[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recipes");
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRecipes();
  }, [fetchAllRecipes]);

  const createRecipe = async (
    recipe: Omit<DbRecipe, "id" | "created_at" | "updated_at">
  ) => {
    const { data, error } = await supabase
      .from("recipes")
      .insert(recipe)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const typedData = data as DbRecipe;
    setRecipes((prev) => [typedData, ...prev]);
    return typedData;
  };

  const updateRecipe = async (id: string, updates: Partial<DbRecipe>) => {
    const { data, error } = await supabase
      .from("recipes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const typedData = data as DbRecipe;
    setRecipes((prev) => prev.map((r) => (r.id === id ? typedData : r)));
    return typedData;
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      throw error;
    }

    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  return {
    recipes,
    isLoading,
    error,
    refetch: fetchAllRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    uploadImage,
  };
}
