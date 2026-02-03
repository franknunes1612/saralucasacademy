-- Persistent auth debug logging (admin-readable, public insert)

CREATE TABLE IF NOT EXISTS public.auth_debug_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  provider text NULL,
  stage text NOT NULL,
  url text NULL,
  user_agent text NULL,
  error_message text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid NULL
);

ALTER TABLE public.auth_debug_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert debug events (including logged-out users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='auth_debug_events' AND policyname='Anyone can insert auth debug events'
  ) THEN
    CREATE POLICY "Anyone can insert auth debug events"
    ON public.auth_debug_events
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Only admins can read debug events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='auth_debug_events' AND policyname='Admins can read auth debug events'
  ) THEN
    CREATE POLICY "Admins can read auth debug events"
    ON public.auth_debug_events
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_auth_debug_events_created_at ON public.auth_debug_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_debug_events_stage ON public.auth_debug_events (stage);
CREATE INDEX IF NOT EXISTS idx_auth_debug_events_provider ON public.auth_debug_events (provider);
