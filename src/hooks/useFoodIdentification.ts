import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FoodItem {
  name: string;
  portion: "small" | "medium" | "large";
  estimatedCalories: number | null;
  category?: string;
  calorieRange?: { min: number; max: number };
}

export type PlateType = "single_item" | "half_plate" | "full_plate" | "mixed_dish" | "bowl" | "snack";

export interface FoodIdentificationResult {
  foodDetected: boolean;
  items: FoodItem[];
  totalCalories: number | { min: number; max: number } | null;
  calorieRange: { min: number; max: number } | null;
  confidenceScore: number | null;
  confidence: "high" | "medium" | "low" | null;
  reasoning: string | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  plateType: PlateType;
  disclaimer: string;
  identifiedAt: string;
}

interface UseFoodIdentificationReturn {
  result: FoodIdentificationResult | null;
  isLoading: boolean;
  error: string | null;
  identifyFood: (imageBase64: string) => Promise<FoodIdentificationResult | null>;
  reset: () => void;
}

export function useFoodIdentification(): UseFoodIdentificationReturn {
  const [result, setResult] = useState<FoodIdentificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifyFood = async (imageBase64: string): Promise<FoodIdentificationResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("identify-food", {
        body: { image: imageBase64 },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to identify food");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const identificationResult = data as FoodIdentificationResult;
      setResult(identificationResult);
      return identificationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to identify food";
      setError(message);
      console.error("[useFoodIdentification] Error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    result,
    isLoading,
    error,
    identifyFood,
    reset,
  };
}
