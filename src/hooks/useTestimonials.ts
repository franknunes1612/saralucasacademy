import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  name: string;
  text_pt: string;
  text_en: string;
  photo_url: string | null;
  category: string;
  rating: number | null;
  linked_product_id: string | null;
  display_order: number;
  is_active: boolean;
  show_on_homepage: boolean;
  show_on_academy: boolean;
  created_at: string;
  updated_at: string;
}

export type TestimonialInsert = Omit<Testimonial, "id" | "created_at" | "updated_at">;
export type TestimonialUpdate = Partial<TestimonialInsert>;

interface UseTestimonialsOptions {
  showOnHomepage?: boolean;
  showOnAcademy?: boolean;
  linkedProductId?: string;
  includeInactive?: boolean;
}

export function useTestimonials(options: UseTestimonialsOptions = {}) {
  const { showOnHomepage, showOnAcademy, linkedProductId, includeInactive } = options;

  return useQuery({
    queryKey: ["testimonials", options],
    queryFn: async () => {
      let query = supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });

      // Only filter by active if not including inactive
      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      if (showOnHomepage !== undefined) {
        query = query.eq("show_on_homepage", showOnHomepage);
      }

      if (showOnAcademy !== undefined) {
        query = query.eq("show_on_academy", showOnAcademy);
      }

      if (linkedProductId) {
        query = query.eq("linked_product_id", linkedProductId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Testimonial[];
    },
  });
}

/**
 * Get testimonials with smart fallback logic:
 * 1. First try to get testimonials linked to a specific product
 * 2. If none found, fall back to general testimonials
 */
export function useSmartTestimonials(productId?: string, location: "academy" | "homepage" = "academy") {
  return useQuery({
    queryKey: ["smart-testimonials", productId, location],
    queryFn: async () => {
      // First, try to get product-specific testimonials
      if (productId) {
        const { data: productTestimonials, error: productError } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .eq("linked_product_id", productId)
          .order("display_order", { ascending: true });

        if (productError) throw productError;

        if (productTestimonials && productTestimonials.length > 0) {
          return productTestimonials as Testimonial[];
        }
      }

      // Fallback to general testimonials for the location
      let query = supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .is("linked_product_id", null)
        .order("display_order", { ascending: true });

      if (location === "academy") {
        query = query.eq("show_on_academy", true);
      } else {
        query = query.eq("show_on_homepage", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Testimonial[];
    },
  });
}

export function useTestimonialMutations() {
  const queryClient = useQueryClient();

  const createTestimonial = useMutation({
    mutationFn: async (testimonial: TestimonialInsert) => {
      const { data, error } = await supabase
        .from("testimonials")
        .insert(testimonial)
        .select()
        .single();

      if (error) throw error;
      return data as Testimonial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["smart-testimonials"] });
    },
  });

  const updateTestimonial = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TestimonialUpdate }) => {
      const { data, error } = await supabase
        .from("testimonials")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Testimonial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["smart-testimonials"] });
    },
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["smart-testimonials"] });
    },
  });

  const reorderTestimonials = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("testimonials")
          .update({ display_order: update.display_order })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["smart-testimonials"] });
    },
  });

  return {
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    reorderTestimonials,
  };
}
