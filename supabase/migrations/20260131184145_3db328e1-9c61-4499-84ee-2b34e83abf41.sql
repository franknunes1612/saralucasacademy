-- Fix scan_feedback SELECT policy to allow admin access for feedback analysis
-- Currently USING (false) blocks all reads, even for improvement purposes

-- Drop the broken policy
DROP POLICY IF EXISTS "Service role can read feedback" ON public.scan_feedback;

-- Create policy allowing admins to read feedback for analysis
CREATE POLICY "Admins can read feedback for analysis"
ON public.scan_feedback
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Note: Regular users can still INSERT feedback (validated submission policy)
-- but cannot read others' feedback - this is intentional for privacy