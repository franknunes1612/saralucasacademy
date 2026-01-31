-- Drop existing SELECT policy on user_profiles (it's currently RESTRICTIVE which may cause issues)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create a new PERMISSIVE policy (default) that explicitly restricts users to ONLY their own profile
-- This is the standard secure pattern for user profile access
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Also add an admin policy so admins can view all profiles if needed for support
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));