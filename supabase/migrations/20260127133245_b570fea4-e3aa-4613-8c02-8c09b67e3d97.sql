-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.scan_feedback;

-- Create a more restrictive policy with data validation
CREATE POLICY "Validated feedback submission"
ON public.scan_feedback
FOR INSERT
WITH CHECK (
  -- Require valid scan_id (non-empty, reasonable length)
  scan_id IS NOT NULL 
  AND length(scan_id) > 0 
  AND length(scan_id) <= 100
  -- Require valid feedback_type (from known types)
  AND feedback_type IN ('correct', 'portion_wrong', 'food_missing', 'calories_off', 'other', 'wrong', 'correct_identification')
  -- Limit user_suggestion length to prevent abuse
  AND (user_suggestion IS NULL OR length(user_suggestion) <= 500)
  -- Limit user_correct_make/model length
  AND (user_correct_make IS NULL OR length(user_correct_make) <= 100)
  AND (user_correct_model IS NULL OR length(user_correct_model) <= 100)
);