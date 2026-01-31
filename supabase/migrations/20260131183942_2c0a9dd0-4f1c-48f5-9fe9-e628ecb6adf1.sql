-- Fix overly permissive INSERT policy on support_messages
-- Add proper validation instead of just true

DROP POLICY IF EXISTS "Anyone can submit support messages" ON public.support_messages;

-- Create a validated INSERT policy for support messages
-- This allows public submissions but validates the input
CREATE POLICY "Validated support message submission"
ON public.support_messages
FOR INSERT
WITH CHECK (
  -- Name validation: required, 1-100 chars
  name IS NOT NULL 
  AND length(trim(name)) >= 1 
  AND length(name) <= 100
  -- Email validation: required, valid format, max 255 chars
  AND email IS NOT NULL 
  AND length(trim(email)) >= 5 
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Message validation: required, 10-5000 chars
  AND message IS NOT NULL 
  AND length(trim(message)) >= 10 
  AND length(message) <= 5000
  -- Category validation: must be valid value
  AND category IN ('app_issue', 'academy_question', 'payment_problem', 'other')
  -- Status must be 'new' on insert (prevent status manipulation)
  AND status = 'new'
  -- Admin notes must be null on insert
  AND admin_notes IS NULL
);