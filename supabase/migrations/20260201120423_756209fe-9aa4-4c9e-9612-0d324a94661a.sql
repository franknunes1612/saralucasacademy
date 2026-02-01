-- Allow anonymous users to submit feedback (scanning doesn't require login)
-- Keep SELECT restricted to admins for privacy

DROP POLICY IF EXISTS "Authenticated users can submit validated feedback" ON public.scan_feedback;

CREATE POLICY "Anyone can submit validated feedback"
ON public.scan_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (scan_id IS NOT NULL) AND 
  (length(scan_id) > 0) AND 
  (length(scan_id) <= 100) AND 
  (feedback_type = ANY (ARRAY['correct'::text, 'portion_wrong'::text, 'food_missing'::text, 'calories_off'::text, 'other'::text, 'wrong'::text, 'correct_identification'::text])) AND 
  ((user_suggestion IS NULL) OR (length(user_suggestion) <= 500)) AND 
  ((user_correct_make IS NULL) OR (length(user_correct_make) <= 100)) AND 
  ((user_correct_model IS NULL) OR (length(user_correct_model) <= 100))
);