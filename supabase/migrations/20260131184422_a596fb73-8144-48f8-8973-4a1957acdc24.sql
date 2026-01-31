-- Remove overly permissive public profile policy
-- This app doesn't have social features requiring public profiles
-- Users should only see their own profile, admins can see all

DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.user_profiles;

-- The existing policies remain:
-- "Users can view their own profile" - USING (auth.uid() = user_id)
-- "Admins can view all profiles" - USING (has_role(auth.uid(), 'admin'))