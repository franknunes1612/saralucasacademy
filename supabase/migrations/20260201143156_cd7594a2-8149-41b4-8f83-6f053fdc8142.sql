-- Add Stripe integration fields to premium_offers table
ALTER TABLE public.premium_offers 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS button_text_pt TEXT DEFAULT 'Comprar',
ADD COLUMN IF NOT EXISTS button_text_en TEXT DEFAULT 'Buy',
ADD COLUMN IF NOT EXISTS enable_purchase BOOLEAN DEFAULT true;

-- Add Stripe integration fields to store_items table
ALTER TABLE public.store_items 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS button_text_pt TEXT DEFAULT 'Comprar',
ADD COLUMN IF NOT EXISTS button_text_en TEXT DEFAULT 'Buy';

-- Add Stripe fields to recommended_products table (for consistency)
ALTER TABLE public.recommended_products
ADD COLUMN IF NOT EXISTS button_text_pt TEXT DEFAULT 'Ver',
ADD COLUMN IF NOT EXISTS button_text_en TEXT DEFAULT 'View';

-- Add Stripe fields to academy_items for direct Stripe product linking
ALTER TABLE public.academy_items
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS button_text_pt TEXT DEFAULT 'Comprar',
ADD COLUMN IF NOT EXISTS button_text_en TEXT DEFAULT 'Buy';