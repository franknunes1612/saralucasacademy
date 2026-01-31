-- Create onboarding_slides table
CREATE TABLE public.onboarding_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'sparkles',
  title_pt text NOT NULL,
  title_en text NOT NULL,
  text_pt text NOT NULL,
  text_en text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_slides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active slides"
  ON public.onboarding_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can read all slides"
  ON public.onboarding_slides FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert slides"
  ON public.onboarding_slides FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update slides"
  ON public.onboarding_slides FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete slides"
  ON public.onboarding_slides FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update timestamp trigger
CREATE TRIGGER update_onboarding_slides_updated_at
  BEFORE UPDATE ON public.onboarding_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed default slides
INSERT INTO public.onboarding_slides (icon, title_pt, title_en, text_pt, text_en, display_order) VALUES
  ('camera', 'Scan Alimentar & Código de Barras', 'Food & Barcode Scanner', 'Fotografa a tua refeição ou produto e obtém informação nutricional instantânea.', 'Photograph your meal or product and get instant nutritional information.', 0),
  ('graduation-cap', 'Academy Completa', 'Complete Academy', 'Cursos, programas, ebooks e bundles para transformar a tua saúde.', 'Courses, programs, ebooks and bundles to transform your health.', 1),
  ('message-circle', 'Fala com Nutricionista', 'Talk to Nutritionist', 'Acompanhamento profissional, consultas e planos personalizados.', 'Professional guidance, consultations and personalized plans.', 2),
  ('dumbbell', 'Programas de Treino', 'Training Programs', 'Treinos guiados e programas de nutrição para atingir os teus objetivos.', 'Guided workouts and nutrition programs to reach your goals.', 3),
  ('utensils', 'Receitas & Refeições', 'Recipes & Meals', 'Receitas fit, acompanhamento de refeições e sugestões inteligentes.', 'Fit recipes, meal tracking and smart suggestions.', 4),
  ('heart-handshake', 'Suporte & Contacto', 'Support & Contact', 'Estamos aqui para ajudar. Contacta-nos quando precisares.', 'We are here to help. Contact us whenever you need.', 5);