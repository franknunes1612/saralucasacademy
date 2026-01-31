-- Create support_messages table for storing support form submissions
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert support messages (public form)
CREATE POLICY "Anyone can submit support messages"
ON public.support_messages
FOR INSERT
WITH CHECK (true);

-- Only admins can view support messages
CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update support messages (status, notes)
CREATE POLICY "Admins can update support messages"
ON public.support_messages
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete support messages
CREATE POLICY "Admins can delete support messages"
ON public.support_messages
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_support_messages_updated_at
BEFORE UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();