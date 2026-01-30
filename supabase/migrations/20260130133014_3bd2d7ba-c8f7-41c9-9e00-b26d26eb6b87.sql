-- Create academy_items table for courses, ebooks, programs, bundles
CREATE TABLE public.academy_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Content type and categorization
  item_type TEXT NOT NULL CHECK (item_type IN ('ebook', 'course', 'program', 'bundle')),
  category TEXT NOT NULL DEFAULT 'nutrition',
  
  -- Localized content
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_pt TEXT,
  subtitle_en TEXT,
  description_pt TEXT,
  description_en TEXT,
  
  -- Visual assets
  cover_image_url TEXT,
  cover_emoji TEXT DEFAULT '📚',
  
  -- Pricing (external links)
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  original_price NUMERIC, -- for showing discounts
  purchase_link TEXT, -- external checkout link
  
  -- Visibility & ordering
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  duration_label TEXT, -- e.g., "4 weeks", "2h video", "50 pages"
  badge_pt TEXT, -- e.g., "Novo", "Popular"
  badge_en TEXT, -- e.g., "New", "Popular"
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.academy_items ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read active items
CREATE POLICY "Anyone can read active academy items"
ON public.academy_items
FOR SELECT
USING (is_active = true);

-- Policies: Admins can read all
CREATE POLICY "Admins can read all academy items"
ON public.academy_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies: Admins can insert
CREATE POLICY "Admins can insert academy items"
ON public.academy_items
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies: Admins can update
CREATE POLICY "Admins can update academy items"
ON public.academy_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies: Admins can delete
CREATE POLICY "Admins can delete academy items"
ON public.academy_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_academy_items_updated_at
BEFORE UPDATE ON public.academy_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_academy_items_type ON public.academy_items(item_type);
CREATE INDEX idx_academy_items_active_order ON public.academy_items(is_active, display_order);
CREATE INDEX idx_academy_items_featured ON public.academy_items(is_featured) WHERE is_featured = true;