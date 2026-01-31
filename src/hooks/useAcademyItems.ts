import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AcademyItemType = "ebook" | "course" | "program" | "bundle";

export interface AcademyItem {
  id: string;
  item_type: AcademyItemType;
  category: string;
  title_pt: string;
  title_en: string;
  subtitle_pt: string | null;
  subtitle_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  cover_emoji: string | null;
  price: number;
  currency: string;
  original_price: number | null;
  purchase_link: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  duration_label: string | null;
  badge_pt: string | null;
  badge_en: string | null;
  created_at: string;
  updated_at: string;
  // Extended course fields
  instructor_name?: string;
  total_duration_minutes?: number;
  total_lessons?: number;
  difficulty_level?: string;
  what_you_learn_pt?: string[];
  what_you_learn_en?: string[];
  video_preview_url?: string;
}

// Public hook - fetches active items only
export function useAcademyItems(type?: AcademyItemType) {
  return useQuery({
    queryKey: ["academy-items", type],
    queryFn: async () => {
      let query = supabase
        .from("academy_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (type) {
        query = query.eq("item_type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AcademyItem[];
    },
  });
}

// Fetch featured items for home page
export function useFeaturedAcademyItems() {
  return useQuery({
    queryKey: ["academy-items", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_items")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as AcademyItem[];
    },
  });
}

// Admin hook - fetches all items including inactive
export function useAdminAcademyItems() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-academy-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_items")
        .select("*")
        .order("item_type", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as AcademyItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (item: Omit<AcademyItem, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("academy_items")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data as AcademyItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-items"] });
      queryClient.invalidateQueries({ queryKey: ["academy-items"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AcademyItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("academy_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AcademyItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-items"] });
      queryClient.invalidateQueries({ queryKey: ["academy-items"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("academy_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-academy-items"] });
      queryClient.invalidateQueries({ queryKey: ["academy-items"] });
    },
  });

  return {
    ...query,
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
