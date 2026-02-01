-- Fix 1: support_messages - ensure only admins can SELECT
DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;
CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: scan_feedback - ensure only admins can SELECT  
DROP POLICY IF EXISTS "Admins can read feedback for analysis" ON public.scan_feedback;
CREATE POLICY "Admins can read feedback for analysis"
ON public.scan_feedback
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Add guest_purchases table to store pending guest purchases
CREATE TABLE IF NOT EXISTS public.guest_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_email text NOT NULL,
  course_id uuid NOT NULL REFERENCES public.academy_items(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL UNIQUE,
  amount_paid numeric,
  currency text DEFAULT 'EUR',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  claimed_at timestamp with time zone,
  claimed_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' NOT NULL
);

-- Enable RLS
ALTER TABLE public.guest_purchases ENABLE ROW LEVEL SECURITY;

-- Only admins can view guest purchases
CREATE POLICY "Admins can view guest purchases"
ON public.guest_purchases
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only edge functions (via service role) can insert/update
-- No user-facing policies for insert/update/delete