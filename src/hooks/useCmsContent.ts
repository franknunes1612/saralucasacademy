import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "./useLanguage";

interface CmsContentEntry {
  id: string;
  key: string;
  value_pt: string;
  value_en: string;
  content_type: "text" | "richtext" | "boolean";
  category: string;
  description: string | null;
  updated_at: string;
}

interface CmsContentState {
  content: Map<string, CmsContentEntry>;
  isLoading: boolean;
  error: string | null;
}

// Default fallback values for critical content
const FALLBACK_CONTENT: Record<string, { pt: string; en: string }> = {
  "onboarding.slide1.title": { pt: "Tire uma foto da sua refeição", en: "Take a photo of your meal" },
  "onboarding.slide1.subtitle": { pt: "A câmara identifica automaticamente os alimentos", en: "The camera automatically identifies foods" },
  "camera.error.firstLoad": { pt: "Não foi possível aceder à câmara", en: "Could not access camera" },
  "camera.loading": { pt: "A preparar câmara...", en: "Setting up camera..." },
  "nutritionist.cta.label": { pt: "Falar com nutricionista", en: "Talk to nutritionist" },
  "disclaimer.aiEstimate": { pt: "Estimativa visual por IA. Valores podem variar.", en: "AI visual estimate. Values may vary." },
  "recipes.section.title": { pt: "Receitas Fit", en: "Fit Recipes" },
};

export function useCmsContent() {
  const [state, setState] = useState<CmsContentState>({
    content: new Map(),
    isLoading: true,
    error: null,
  });
  const { language } = useLanguage();

  const fetchContent = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;

      const contentMap = new Map<string, CmsContentEntry>();
      (data || []).forEach((entry) => {
        contentMap.set(entry.key, entry as CmsContentEntry);
      });

      setState({ content: contentMap, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch content",
      }));
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Get content value with fallback
  const get = useCallback(
    (key: string, fallback?: { pt: string; en: string }): string => {
      const entry = state.content.get(key);
      
      if (entry) {
        return language === "pt" ? entry.value_pt : entry.value_en;
      }

      // Use provided fallback or default fallback
      const defaultFallback = fallback || FALLBACK_CONTENT[key];
      if (defaultFallback) {
        return language === "pt" ? defaultFallback.pt : defaultFallback.en;
      }

      // Return key as last resort (helps identify missing content)
      return key;
    },
    [state.content, language]
  );

  // Get boolean feature flag
  const isFeatureEnabled = useCallback(
    (key: string): boolean => {
      const entry = state.content.get(key);
      if (entry && entry.content_type === "boolean") {
        return entry.value_en.toLowerCase() === "true";
      }
      return true; // Default to enabled
    },
    [state.content]
  );

  // Get all entries for admin
  const getAllEntries = useCallback((): CmsContentEntry[] => {
    return Array.from(state.content.values());
  }, [state.content]);

  // Get entries by category for admin
  const getByCategory = useCallback(
    (category: string): CmsContentEntry[] => {
      return getAllEntries().filter((entry) => entry.category === category);
    },
    [getAllEntries]
  );

  // Get unique categories
  const getCategories = useCallback((): string[] => {
    const categories = new Set<string>();
    state.content.forEach((entry) => categories.add(entry.category));
    return Array.from(categories).sort();
  }, [state.content]);

  return {
    ...state,
    get,
    isFeatureEnabled,
    getAllEntries,
    getByCategory,
    getCategories,
    refetch: fetchContent,
  };
}

// Admin hook for CRUD operations
export function useAdminCmsContent() {
  const [entries, setEntries] = useState<CmsContentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("cms_content")
        .select("*")
        .order("category", { ascending: true })
        .order("key", { ascending: true });

      if (fetchError) throw fetchError;

      setEntries((data || []) as CmsContentEntry[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch content");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEntries();
  }, [fetchAllEntries]);

  const createEntry = async (
    entry: Omit<CmsContentEntry, "id" | "updated_at">
  ): Promise<CmsContentEntry> => {
    const { data, error } = await supabase
      .from("cms_content")
      .insert(entry)
      .select()
      .single();

    if (error) throw error;

    const typedData = data as CmsContentEntry;
    setEntries((prev) => [...prev, typedData]);
    return typedData;
  };

  const updateEntry = async (
    id: string,
    updates: Partial<CmsContentEntry>
  ): Promise<CmsContentEntry> => {
    const { data, error } = await supabase
      .from("cms_content")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const typedData = data as CmsContentEntry;
    setEntries((prev) => prev.map((e) => (e.id === id ? typedData : e)));
    return typedData;
  };

  const deleteEntry = async (id: string): Promise<void> => {
    const { error } = await supabase.from("cms_content").delete().eq("id", id);

    if (error) throw error;

    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Get unique categories
  const getCategories = useCallback((): string[] => {
    const categories = new Set<string>();
    entries.forEach((entry) => categories.add(entry.category));
    return Array.from(categories).sort();
  }, [entries]);

  return {
    entries,
    isLoading,
    error,
    refetch: fetchAllEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getCategories,
  };
}
