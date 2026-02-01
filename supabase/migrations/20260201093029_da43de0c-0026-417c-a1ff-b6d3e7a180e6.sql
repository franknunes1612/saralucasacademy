-- Create testimonials table
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text_pt text NOT NULL,
  text_en text NOT NULL,
  photo_url text,
  category text NOT NULL DEFAULT 'general',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  linked_product_id uuid REFERENCES public.academy_items(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  show_on_homepage boolean NOT NULL DEFAULT false,
  show_on_academy boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add comment for category values
COMMENT ON COLUMN public.testimonials.category IS 'Values: training, nutrition, course, consultation, general';

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can read all testimonials"
ON public.testimonials
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update testimonials"
ON public.testimonials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for testimonial photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial-photos', 'testimonial-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for testimonial photos
CREATE POLICY "Anyone can view testimonial photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'testimonial-photos');

CREATE POLICY "Admins can upload testimonial photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'testimonial-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update testimonial photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'testimonial-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonial photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'testimonial-photos' AND has_role(auth.uid(), 'admin'::app_role));