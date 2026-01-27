-- Update bootstrap_admin_role function with new admin email
CREATE OR REPLACE FUNCTION public.bootstrap_admin_role(_user_id uuid, _email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails text[] := ARRAY[
    'sara@caloriespot.app',
    'admin@caloriespot.app',
    'franknunes1612@gmail.com',
    'sarasoareslucascoelho@gmail.com'
  ];
  is_admin_email boolean;
BEGIN
  -- Check if email is in admin whitelist
  is_admin_email := _email = ANY(admin_emails);
  
  IF is_admin_email THEN
    -- Insert or update admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;