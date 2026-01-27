-- Create recommended_products table (completely separate from premium_offers and store_items)
CREATE TABLE public.recommended_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_pt TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_pt TEXT,
  description_en TEXT,
  image_url TEXT,
  image_emoji TEXT DEFAULT '📦',
  external_link TEXT,
  category TEXT NOT NULL CHECK (category IN ('supplement', 'equipment', 'food', 'kitchen', 'fitness', 'other')),
  brand TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Anyone can read active recommended products"
  ON public.recommended_products
  FOR SELECT
  USING (is_active = true);

-- Admins can read all
CREATE POLICY "Admins can read all recommended products"
  ON public.recommended_products
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins can insert
CREATE POLICY "Admins can insert recommended products"
  ON public.recommended_products
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update recommended products"
  ON public.recommended_products
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete recommended products"
  ON public.recommended_products
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Seed with sample recommended products (external affiliate links)
INSERT INTO public.recommended_products (name_pt, name_en, description_pt, description_en, image_emoji, external_link, category, brand, display_order) VALUES
('Proteína Whey Isolada', 'Whey Protein Isolate', 'Proteína de alta qualidade para recuperação muscular', 'High-quality protein for muscle recovery', '🥛', 'https://amazon.com', 'supplement', 'Optimum Nutrition', 1),
('Balança de Cozinha Digital', 'Digital Kitchen Scale', 'Precisão até 1g para medir porções', 'Precision up to 1g for measuring portions', '⚖️', 'https://amazon.com', 'kitchen', 'Etekcity', 2),
('Shaker para Batidos', 'Protein Shaker Bottle', 'Shaker com compartimento para suplementos', 'Shaker with supplement compartment', '🍶', 'https://amazon.com', 'fitness', 'BlenderBottle', 3),
('Aveia Integral', 'Whole Oats', 'Fonte natural de fibras e carboidratos complexos', 'Natural source of fiber and complex carbs', '🌾', 'https://amazon.com', 'food', 'Quaker', 4),
('Creatina Monohidratada', 'Creatine Monohydrate', 'Suplemento para força e performance', 'Supplement for strength and performance', '💪', 'https://amazon.com', 'supplement', 'Creapure', 5);