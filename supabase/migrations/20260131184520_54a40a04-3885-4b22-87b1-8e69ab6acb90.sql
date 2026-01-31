-- Fix support_messages to require authentication
-- This prevents spam and abuse while still allowing validated submissions

-- Drop the current policy that allows anonymous submissions
DROP POLICY IF EXISTS "Validated support message submission" ON public.support_messages;

-- Create new policy requiring authentication + validation
CREATE POLICY "Authenticated users can submit support messages"
ON public.support_messages
FOR INSERT
TO authenticated
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