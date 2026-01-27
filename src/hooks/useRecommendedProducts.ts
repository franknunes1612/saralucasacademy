import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecommendedProduct {
  id: string;
  name_pt: string;
  name_en: string;
  description_pt: string | null;
  description_en: string | null;
  image_url: string | null;
  image_emoji: string | null;
  external_link: string | null;
  category: string;
  brand: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useRecommendedProducts(includeInactive = false) {
  return useQuery({
    queryKey: ["recommended-products", includeInactive],
    queryFn: async () => {
      // Using type assertion since recommended_products table was just created
      let query = (supabase.from as any)("recommended_products")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching recommended products:", error);
        throw error;
      }

      return data as RecommendedProduct[];
    },
  });
}

export function useRecommendedProductMutations() {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (product: Omit<RecommendedProduct, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await (supabase.from as any)("recommended_products")
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-products"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecommendedProduct> & { id: string }) => {
      const { data, error } = await (supabase.from as any)("recommended_products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)("recommended_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-products"] });
    },
  });

  return { createProduct, updateProduct, deleteProduct };
}
