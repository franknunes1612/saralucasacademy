import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type StoreItem = Tables<"store_items">;
export type StoreItemInsert = TablesInsert<"store_items">;
export type StoreItemUpdate = TablesUpdate<"store_items">;

export function useStoreItems(includeInactive = false) {
  return useQuery({
    queryKey: ["store-items", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("store_items")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StoreItem[];
    },
  });
}

export function useCreateStoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: StoreItemInsert) => {
      const { data, error } = await supabase
        .from("store_items")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
    },
  });
}

export function useUpdateStoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: StoreItemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("store_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
    },
  });
}

export function useDeleteStoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("store_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
    },
  });
}
