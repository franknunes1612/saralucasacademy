-- Create CMS content table for editable app content
CREATE TABLE public.cms_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value_pt TEXT NOT NULL DEFAULT '',
  value_en TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'richtext', 'boolean')),
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read content (it's public app content)
CREATE POLICY "Anyone can read CMS content"
ON public.cms_content
FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert CMS content"
ON public.cms_content
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update CMS content"
ON public.cms_content
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete CMS content"
ON public.cms_content
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_cms_content_updated_at
BEFORE UPDATE ON public.cms_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content entries
INSERT INTO public.cms_content (key, value_pt, value_en, content_type, category, description) VALUES
('onboarding.slide1.title', 'Tire uma foto da sua refeição', 'Take a photo of your meal', 'text', 'onboarding', 'First onboarding slide title'),
('onboarding.slide1.subtitle', 'A câmara identifica automaticamente os alimentos', 'The camera automatically identifies foods', 'text', 'onboarding', 'First onboarding slide subtitle'),
('onboarding.slide2.title', 'Receba estimativas de calorias', 'Get calorie estimates', 'text', 'onboarding', 'Second onboarding slide title'),
('onboarding.slide2.subtitle', 'Veja uma estimativa visual das calorias e macros', 'See a visual estimate of calories and macros', 'text', 'onboarding', 'Second onboarding slide subtitle'),
('camera.error.firstLoad', 'Não foi possível aceder à câmara', 'Could not access camera', 'text', 'camera', 'Camera first load error message'),
('camera.loading', 'A preparar câmara...', 'Setting up camera...', 'text', 'camera', 'Camera loading message'),
('nutritionist.cta.label', 'Falar com nutricionista', 'Talk to nutritionist', 'text', 'nutritionist', 'CTA button for nutritionist'),
('nutritionist.cta.message', 'Olá! Gostaria de falar sobre nutrição.', 'Hi! I would like to talk about nutrition.', 'text', 'nutritionist', 'Default WhatsApp message'),
('disclaimer.aiEstimate', 'Estimativa visual por IA. Valores podem variar.', 'AI visual estimate. Values may vary.', 'text', 'disclaimers', 'AI estimate disclaimer'),
('recipes.section.title', 'Receitas Fit', 'Fit Recipes', 'text', 'recipes', 'Recipes section title'),
('premium.cta', 'Desbloqueie todos os recursos', 'Unlock all features', 'text', 'premium', 'Premium CTA text'),
('feature.barcode.enabled', 'true', 'true', 'boolean', 'features', 'Enable barcode scanning feature'),
('feature.recipes.enabled', 'true', 'true', 'boolean', 'features', 'Enable recipes feature');