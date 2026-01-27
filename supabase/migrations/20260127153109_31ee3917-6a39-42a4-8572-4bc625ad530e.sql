-- Create role enum (if not exists, use DO block)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for admin access
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create recipes table
CREATE TABLE public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    category TEXT NOT NULL CHECK (category IN ('light', 'balanced', 'rich')),
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'any')),
    calories INTEGER NOT NULL CHECK (calories > 0 AND calories <= 5000),
    protein INTEGER NOT NULL DEFAULT 0 CHECK (protein >= 0),
    carbs INTEGER NOT NULL DEFAULT 0 CHECK (carbs >= 0),
    fat INTEGER NOT NULL DEFAULT 0 CHECK (fat >= 0),
    ingredients_pt TEXT[] NOT NULL DEFAULT '{}',
    ingredients_en TEXT[] NOT NULL DEFAULT '{}',
    steps_pt TEXT[] NOT NULL DEFAULT '{}',
    steps_en TEXT[] NOT NULL DEFAULT '{}',
    prep_time INTEGER DEFAULT 15 CHECK (prep_time > 0),
    portion_pt TEXT DEFAULT '1 porção',
    portion_en TEXT DEFAULT '1 serving',
    image_url TEXT,
    image_emoji TEXT DEFAULT '🍽️',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Everyone can read active recipes
CREATE POLICY "Anyone can read active recipes"
ON public.recipes
FOR SELECT
USING (is_active = true);

-- Admins can read all recipes (including inactive)
CREATE POLICY "Admins can read all recipes"
ON public.recipes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert recipes
CREATE POLICY "Admins can insert recipes"
ON public.recipes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update recipes
CREATE POLICY "Admins can update recipes"
ON public.recipes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete recipes
CREATE POLICY "Admins can delete recipes"
ON public.recipes
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on recipes
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for recipe images
CREATE POLICY "Anyone can view recipe images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recipe-images');

CREATE POLICY "Admins can upload recipe images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recipe-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update recipe images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'recipe-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete recipe images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'recipe-images' AND public.has_role(auth.uid(), 'admin'));