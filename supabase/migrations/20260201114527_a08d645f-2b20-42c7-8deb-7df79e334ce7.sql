-- Fix 1: support_messages - ensure only admins can SELECT (remove any public access)
-- First ensure RLS is enabled
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing SELECT policies and recreate admin-only
DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Anyone can read support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Public can read support messages" ON public.support_messages;

CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: guest_purchases - ensure only admins can SELECT
ALTER TABLE public.guest_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view guest purchases" ON public.guest_purchases;
DROP POLICY IF EXISTS "Anyone can read guest purchases" ON public.guest_purchases;
DROP POLICY IF EXISTS "Public can read guest purchases" ON public.guest_purchases;

CREATE POLICY "Admins can view guest purchases"
ON public.guest_purchases
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: scan_feedback - require authentication for INSERT (already has RLS but needs auth check)
ALTER TABLE public.scan_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Validated feedback submission" ON public.scan_feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.scan_feedback;

-- Require authentication AND validation for feedback submission
CREATE POLICY "Authenticated users can submit validated feedback"
ON public.scan_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  (scan_id IS NOT NULL) AND 
  (length(scan_id) > 0) AND 
  (length(scan_id) <= 100) AND 
  (feedback_type = ANY (ARRAY['correct'::text, 'portion_wrong'::text, 'food_missing'::text, 'calories_off'::text, 'other'::text, 'wrong'::text, 'correct_identification'::text])) AND 
  ((user_suggestion IS NULL) OR (length(user_suggestion) <= 500)) AND 
  ((user_correct_make IS NULL) OR (length(user_correct_make) <= 100)) AND 
  ((user_correct_model IS NULL) OR (length(user_correct_model) <= 100))
);