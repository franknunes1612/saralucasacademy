import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

export interface OnboardingSlide {
  id: string;
  icon: string;
  title_pt: string;
  title_en: string;
  text_pt: string;
  text_en: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingSlideContent {
  id: string;
  icon: string;
  title: string;
  text: string;
  display_order: number;
  is_active: boolean;
}

// Default fallback slides in case database is empty
const FALLBACK_SLIDES: Omit<OnboardingSlide, "id" | "created_at" | "updated_at">[] = [
  {
    icon: "camera",
    title_pt: "Scan Alimentar & Código de Barras",
    title_en: "Food & Barcode Scanner",
    text_pt: "Fotografa a tua refeição ou produto e obtém informação nutricional instantânea.",
    text_en: "Photograph your meal or product and get instant nutritional information.",
    display_order: 0,
    is_active: true,
  },
  {
    icon: "graduation-cap",
    title_pt: "Academy Completa",
    title_en: "Complete Academy",
    text_pt: "Cursos, programas, ebooks e bundles para transformar a tua saúde.",
    text_en: "Courses, programs, ebooks and bundles to transform your health.",
    display_order: 1,
    is_active: true,
  },
  {
    icon: "message-circle",
    title_pt: "Fala com Nutricionista",
    title_en: "Talk to Nutritionist",
    text_pt: "Acompanhamento profissional, consultas e planos personalizados.",
    text_en: "Professional guidance, consultations and personalized plans.",
    display_order: 2,
    is_active: true,
  },
  {
    icon: "dumbbell",
    title_pt: "Programas de Treino",
    title_en: "Training Programs",
    text_pt: "Treinos guiados e programas de nutrição para atingir os teus objetivos.",
    text_en: "Guided workouts and nutrition programs to reach your goals.",
    display_order: 3,
    is_active: true,
  },
  {
    icon: "utensils",
    title_pt: "Receitas & Refeições",
    title_en: "Recipes & Meals",
    text_pt: "Receitas fit, acompanhamento de refeições e sugestões inteligentes.",
    text_en: "Fit recipes, meal tracking and smart suggestions.",
    display_order: 4,
    is_active: true,
  },
  {
    icon: "heart-handshake",
    title_pt: "Suporte & Contacto",
    title_en: "Support & Contact",
    text_pt: "Estamos aqui para ajudar. Contacta-nos quando precisares.",
    text_en: "We are here to help. Contact us whenever you need.",
    display_order: 5,
    is_active: true,
  },
];

/**
 * Public hook - fetches active slides ordered by display_order
 * Returns localized content based on current language
 */
export function useOnboardingSlides() {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ["onboarding-slides", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_slides")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as OnboardingSlide[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Transform slides to localized content
  const slides: OnboardingSlideContent[] = (query.data && query.data.length > 0 ? query.data : FALLBACK_SLIDES.map((s, i) => ({
    ...s,
    id: `fallback-${i}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))).map((slide) => ({
    id: slide.id,
    icon: slide.icon,
    title: language === "pt" ? slide.title_pt : slide.title_en,
    text: language === "pt" ? slide.text_pt : slide.text_en,
    display_order: slide.display_order,
    is_active: slide.is_active,
  }));

  return {
    slides,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Admin hook - fetches ALL slides (active + inactive) with full CRUD operations
 */
export function useAdminOnboardingSlides() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["onboarding-slides", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_slides")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as OnboardingSlide[];
    },
  });

  const createSlide = useMutation({
    mutationFn: async (slide: Omit<OnboardingSlide, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("onboarding_slides")
        .insert(slide)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-slides"] });
    },
  });

  const updateSlide = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OnboardingSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from("onboarding_slides")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-slides"] });
    },
  });

  const deleteSlide = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("onboarding_slides")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-slides"] });
    },
  });

  const reorderSlides = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each slide's display_order
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("onboarding_slides")
          .update({ display_order: i })
          .eq("id", orderedIds[i]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-slides"] });
    },
  });

  return {
    slides: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
  };
}
