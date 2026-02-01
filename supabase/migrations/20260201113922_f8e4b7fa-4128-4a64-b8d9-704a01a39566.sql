-- Fix support_messages table to ensure only admins can read (not publicly accessible)
-- Drop existing SELECT policy and recreate as PERMISSIVE admin-only

DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;

-- Create proper PERMISSIVE admin-only SELECT policy
CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));