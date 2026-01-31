-- Create course_lessons table for video lessons within courses
CREATE TABLE public.course_lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.academy_items(id) ON DELETE CASCADE,
    title_pt TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_preview BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups by course
CREATE INDEX idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX idx_course_lessons_order ON public.course_lessons(course_id, display_order);

-- Enable RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active lessons for active courses
CREATE POLICY "Anyone can read active lessons"
ON public.course_lessons
FOR SELECT
USING (
    is_active = true AND
    EXISTS (
        SELECT 1 FROM public.academy_items
        WHERE id = course_id AND is_active = true
    )
);

-- Admins can read all lessons
CREATE POLICY "Admins can read all lessons"
ON public.course_lessons
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert lessons
CREATE POLICY "Admins can insert lessons"
ON public.course_lessons
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update lessons
CREATE POLICY "Admins can update lessons"
ON public.course_lessons
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete lessons
CREATE POLICY "Admins can delete lessons"
ON public.course_lessons
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_course_lessons_updated_at
BEFORE UPDATE ON public.course_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add additional columns to academy_items for course-specific data
ALTER TABLE public.academy_items
ADD COLUMN IF NOT EXISTS instructor_name TEXT DEFAULT 'Sara Lucas',
ADD COLUMN IF NOT EXISTS total_duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_lessons INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS what_you_learn_pt TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS what_you_learn_en TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_preview_url TEXT;