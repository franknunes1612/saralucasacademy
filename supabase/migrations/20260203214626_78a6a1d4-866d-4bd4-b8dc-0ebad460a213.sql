-- Tighten RLS: replace permissive INSERT policy with a constrained one

DROP POLICY IF EXISTS "Anyone can insert auth debug events" ON public.auth_debug_events;

CREATE POLICY "Public can insert constrained auth debug events"
ON public.auth_debug_events
FOR INSERT
WITH CHECK (
  stage IN (
    'oauth_initiate_page_loaded',
    'oauth_initiate_start',
    'oauth_initiate_error',
    'oauth_return_page_loaded',
    'oauth_return_redirect_profile',
    'profile_provider_params_detected',
    'profile_oauth_start',
    'profile_oauth_error',
    'authmodal_oauth_start',
    'authmodal_oauth_error',
    'app_oauth_detected'
  )
  AND (
    provider IS NULL OR provider IN ('google','apple')
  )
  AND (
    url IS NULL OR (
      url LIKE 'https://saralucas.pt/%'
      OR url LIKE 'https://www.saralucas.pt/%'
      OR url LIKE 'https://saralucasacademy.lovable.app/%'
      OR url LIKE 'https://%.lovable.app/%'
    )
  )
);
