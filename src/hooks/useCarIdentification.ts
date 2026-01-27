import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CarIdentificationResult {
  make: string | null;
  model: string | null;
  year: number | null;
  spotScore: number | null;
  confidenceScore: number | null;
  confidence: "high" | "medium" | "low" | null;
  disclaimer: string;
  identifiedAt: string;
}

interface UseCarIdentificationReturn {
  result: CarIdentificationResult | null;
  isLoading: boolean;
  error: string | null;
  identifyCar: (imageBase64: string) => Promise<CarIdentificationResult | null>;
  reset: () => void;
}

export function useCarIdentification(): UseCarIdentificationReturn {
  const [result, setResult] = useState<CarIdentificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifyCar = async (imageBase64: string): Promise<CarIdentificationResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("identify-car", {
        body: { image: imageBase64 },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to identify vehicle");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const identificationResult = data as CarIdentificationResult;
      setResult(identificationResult);
      return identificationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to identify vehicle";
      setError(message);
      console.error("[useCarIdentification] Error:", err);
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
    identifyCar,
    reset,
  };
}
