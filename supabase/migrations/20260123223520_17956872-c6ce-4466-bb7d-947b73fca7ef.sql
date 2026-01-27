-- Create scan feedback table
CREATE TABLE public.scan_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id TEXT NOT NULL,
  detected_make TEXT,
  detected_model TEXT,
  detected_year TEXT,
  detected_vehicle_type TEXT,
  confidence_score NUMERIC,
  spot_score NUMERIC,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('correct', 'wrong_make', 'wrong_model', 'wrong_vehicle_type', 'other')),
  user_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (anonymous feedback for MVP)
CREATE POLICY "Anyone can submit feedback"
ON public.scan_feedback
FOR INSERT
WITH CHECK (true);

-- Only service role can read feedback (for future analytics)
CREATE POLICY "Service role can read feedback"
ON public.scan_feedback
FOR SELECT
USING (false);

-- Add index for analytics queries
CREATE INDEX idx_scan_feedback_type ON public.scan_feedback(feedback_type);
CREATE INDEX idx_scan_feedback_created ON public.scan_feedback(created_at DESC);