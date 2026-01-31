-- Add policy for authenticated users to view public profile data (display_name, avatar_url)
-- This enables social features while maintaining privacy
-- Users can already see their own full profile, this adds read access to other users' public info

CREATE POLICY "Authenticated users can view public profile data"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: Since user_profiles only contains display_name, avatar_url, user_id, 
-- and timestamps (no sensitive data like email), this is safe.
-- The existing "Users can view their own profile" policy can be kept for clarity
-- but this new policy provides broader read access for social features.