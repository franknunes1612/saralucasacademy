-- Fix support_messages - ensure only admins can SELECT (drop and recreate as PERMISSIVE)
DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;
CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix scan_feedback - ensure only admins can SELECT (drop and recreate as PERMISSIVE)
DROP POLICY IF EXISTS "Admins can read feedback for analysis" ON public.scan_feedback;
CREATE POLICY "Admins can read feedback for analysis"
ON public.scan_feedback
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));