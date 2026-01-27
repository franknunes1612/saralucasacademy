import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type PremiumOffer = Tables<"premium_offers">;
export type PremiumOfferInsert = TablesInsert<"premium_offers">;
export type PremiumOfferUpdate = TablesUpdate<"premium_offers">;

export function usePremiumOffers(includeInactive = false) {
  return useQuery({
    queryKey: ["premium-offers", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("premium_offers")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PremiumOffer[];
    },
  });
}

export function useCreatePremiumOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offer: PremiumOfferInsert) => {
      const { data, error } = await supabase
        .from("premium_offers")
        .insert(offer)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium-offers"] });
    },
  });
}

export function useUpdatePremiumOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PremiumOfferUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("premium_offers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium-offers"] });
    },
  });
}

export function useDeletePremiumOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("premium_offers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium-offers"] });
    },
  });
}
