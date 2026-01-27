-- Add correction signal fields to scan_feedback table
ALTER TABLE public.scan_feedback
ADD COLUMN user_correct_make text,
ADD COLUMN user_correct_model text,
ADD COLUMN image_hash text,
ADD COLUMN reviewed boolean NOT NULL DEFAULT false;