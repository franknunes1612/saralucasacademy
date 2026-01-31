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
  // App Settings - Splash
  "app.splash.enabled": { pt: "true", en: "true" },
  "app.splash.duration": { pt: "2000", en: "2000" },
  "app.splash.title": { pt: "Sara Lucas", en: "Sara Lucas" },
  "app.splash.subtitle": { pt: "Nutrição & Training Academy", en: "Nutrition & Training Academy" },
  // App Settings - Onboarding
  "app.onboarding.enabled": { pt: "true", en: "true" },
  "app.onboarding.showMode": { pt: "first-visit", en: "first-visit" },
  "app.onboarding.slideDuration": { pt: "3000", en: "3000" },
  "app.onboarding.autoPlay": { pt: "true", en: "true" },
  // Onboarding Slides
  "onboarding.slide1.icon": { pt: "camera", en: "camera" },
  "onboarding.slide1.title": { pt: "Scan Alimentar & Código de Barras", en: "Food & Barcode Scanner" },
  "onboarding.slide1.text": { pt: "Fotografa a tua refeição ou produto e obtém informação nutricional instantânea.", en: "Photograph your meal or product and get instant nutritional information." },
  "onboarding.slide2.icon": { pt: "graduation-cap", en: "graduation-cap" },
  "onboarding.slide2.title": { pt: "Academy Completa", en: "Complete Academy" },
  "onboarding.slide2.text": { pt: "Cursos, programas, ebooks e bundles para transformar a tua saúde.", en: "Courses, programs, ebooks and bundles to transform your health." },
  "onboarding.slide3.icon": { pt: "message-circle", en: "message-circle" },
  "onboarding.slide3.title": { pt: "Fala com Nutricionista", en: "Talk to Nutritionist" },
  "onboarding.slide3.text": { pt: "Acompanhamento profissional, consultas e planos personalizados.", en: "Professional guidance, consultations and personalized plans." },
  "onboarding.slide4.icon": { pt: "dumbbell", en: "dumbbell" },
  "onboarding.slide4.title": { pt: "Programas de Treino", en: "Training Programs" },
  "onboarding.slide4.text": { pt: "Treinos guiados e programas de nutrição para atingir os teus objetivos.", en: "Guided workouts and nutrition programs to reach your goals." },
  "onboarding.slide5.icon": { pt: "utensils", en: "utensils" },
  "onboarding.slide5.title": { pt: "Receitas & Refeições", en: "Recipes & Meals" },
  "onboarding.slide5.text": { pt: "Receitas fit, acompanhamento de refeições e sugestões inteligentes.", en: "Fit recipes, meal tracking and smart suggestions." },
  "onboarding.slide6.icon": { pt: "heart-handshake", en: "heart-handshake" },
  "onboarding.slide6.title": { pt: "Suporte & Contacto", en: "Support & Contact" },
  "onboarding.slide6.text": { pt: "Estamos aqui para ajudar. Contacta-nos quando precisares.", en: "We are here to help. Contact us whenever you need." },
  // Camera & Scanner
  "camera.error.firstLoad": { pt: "Não foi possível aceder à câmara", en: "Could not access camera" },
  "camera.loading": { pt: "A preparar câmara...", en: "Setting up camera..." },
  "nutritionist.cta.label": { pt: "Falar com nutricionista", en: "Talk to nutritionist" },
  "disclaimer.aiEstimate": { pt: "Estimativa visual por IA. Valores podem variar.", en: "AI visual estimate. Values may vary." },
  "recipes.section.title": { pt: "Receitas Fit", en: "Fit Recipes" },
  // Academy - Page Header
  "academy.hero.title": { pt: "Academy", en: "Academy" },
  "academy.hero.subtitle": { pt: "Cursos, programas e aulas gravadas para transformar a sua saúde", en: "Courses, programs and recorded classes to transform your health" },
  // Academy - Hero Section
  "academy.hero.headline": { pt: "Transforma o teu corpo e a tua saúde", en: "Transform your body and health" },
  "academy.hero.subheadline": { pt: "Programas de treino, nutrição guiada e educação contínua. Cursos, ebooks e programas criados por profissional certificada.", en: "Training programs, guided nutrition and continuous education. Courses, ebooks and programs created by a certified professional." },
  "academy.hero.badge.label": { pt: "Personal Trainer & Nutricionista", en: "Personal Trainer & Nutritionist" },
  "academy.hero.cta.primary.label": { pt: "Explorar Cursos", en: "Explore Courses" },
  "academy.hero.cta.primary.link": { pt: "/learn?type=course", en: "/learn?type=course" },
  "academy.hero.cta.secondary.label": { pt: "Ver Programas", en: "View Programs" },
  "academy.hero.cta.secondary.link": { pt: "/learn?type=program", en: "/learn?type=program" },
  "academy.hero.cta.tertiary.label": { pt: "Academia Completa", en: "Full Academy" },
  "academy.hero.cta.tertiary.link": { pt: "/learn", en: "/learn" },
  "academy.hero.cta.tertiary.enabled": { pt: "false", en: "false" },
  "academy.hero.layout": { pt: "static", en: "static" },
  "academy.hero.animations.enabled": { pt: "true", en: "true" },
  // Academy Hero - Feature Tags
  "academy.hero.tags.enabled": { pt: "true", en: "true" },
  "academy.hero.tag1.icon": { pt: "dumbbell", en: "dumbbell" },
  "academy.hero.tag1.label": { pt: "Treino", en: "Training" },
  "academy.hero.tag2.icon": { pt: "utensils", en: "utensils" },
  "academy.hero.tag2.label": { pt: "Nutrição", en: "Nutrition" },
  "academy.hero.tag3.icon": { pt: "book-open", en: "book-open" },
  "academy.hero.tag3.label": { pt: "Educação", en: "Education" },
  // Academy - Filters & Search
  "academy.search.placeholder": { pt: "Pesquisar conteúdo...", en: "Search content..." },
  "academy.filter.all": { pt: "Todos", en: "All" },
  "academy.filter.courses": { pt: "Cursos", en: "Courses" },
  "academy.filter.ebooks": { pt: "Ebooks", en: "Ebooks" },
  "academy.filter.programs": { pt: "Programas", en: "Programs" },
  "academy.filter.bundles": { pt: "Bundles", en: "Bundles" },
  // Academy - Categories
  "academy.categories.title": { pt: "Categorias", en: "Categories" },
  "academy.categories.training": { pt: "Treino", en: "Training" },
  "academy.categories.nutrition": { pt: "Nutrição", en: "Nutrition" },
  "academy.categories.programs": { pt: "Programas", en: "Programs" },
  "academy.categories.beginners": { pt: "Iniciantes", en: "Beginners" },
  "academy.categories.advanced": { pt: "Avançado", en: "Advanced" },
  // Academy - Content Sections
  "academy.featured.title": { pt: "Destaque", en: "Featured" },
  "academy.allCourses.title": { pt: "Todos os cursos", en: "All courses" },
  "academy.moreContent.title": { pt: "Mais conteúdos", en: "More content" },
  "academy.empty.title": { pt: "Brevemente novos conteúdos", en: "New content coming soon" },
  "academy.empty.noResults": { pt: "Nenhum resultado encontrado", en: "No results found" },
  "academy.footer.disclaimer": { pt: "Todos os conteúdos são criados por profissionais certificados. Compras processadas externamente com segurança.", en: "All content is created by certified professionals. Purchases processed securely externally." },
  // Academy - Course Card
  "academy.course.videoLabel": { pt: "Curso em vídeo", en: "Video course" },
  "academy.course.lessons": { pt: "aulas", en: "lessons" },
  "academy.course.viewCourse": { pt: "Ver curso", en: "View course" },
  // Academy - Course Detail
  "academy.detail.about": { pt: "Sobre o curso", en: "About this course" },
  "academy.detail.whatYouLearn": { pt: "O que vais aprender", en: "What you'll learn" },
  "academy.detail.content": { pt: "Conteúdo do curso", en: "Course content" },
  "academy.detail.completed": { pt: "concluídas", en: "completed" },
  "academy.detail.preview": { pt: "Prévia", en: "Preview" },
  "academy.detail.lifetimeAccess": { pt: "Acesso vitalício após a compra. Compras processadas externamente com segurança.", en: "Lifetime access after purchase. Purchases processed securely externally." },
  "academy.detail.accessLabel": { pt: "Acesso vitalício", en: "Lifetime access" },
  "academy.detail.buyNow": { pt: "Comprar", en: "Buy now" },
  "academy.detail.continue": { pt: "Continuar", en: "Continue" },
  "academy.detail.notFound": { pt: "Curso não encontrado", en: "Course not found" },
  "academy.detail.backToAcademy": { pt: "Voltar à Academia", en: "Back to Academy" },
  "academy.detail.yourProgress": { pt: "Seu progresso", en: "Your Progress" },
  "academy.detail.courseComplete": { pt: "Curso concluído!", en: "Course complete!" },
  "academy.detail.markComplete": { pt: "Marcar como concluído", en: "Mark complete" },
  "academy.detail.unlocked": { pt: "Desbloqueado", en: "Unlocked" },
  "academy.detail.lessonsCompleted": { pt: "aulas concluídas", en: "lessons completed" },
  "academy.detail.loginPrompt": { pt: "Faça login para acompanhar seu progresso", en: "Log in to track your progress" },
  "academy.detail.loginButton": { pt: "Entrar", en: "Log in" },
  // Academy - Difficulty
  "academy.difficulty.beginner": { pt: "Iniciante", en: "Beginner" },
  "academy.difficulty.intermediate": { pt: "Intermédio", en: "Intermediate" },
  "academy.difficulty.advanced": { pt: "Avançado", en: "Advanced" },
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
