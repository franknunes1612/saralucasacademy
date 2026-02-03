import { supabase } from "@/integrations/supabase/client";

export type AuthDebugProvider = "google" | "apple";

export type AuthDebugStage =
  | "authmodal_oauth_start"
  | "authmodal_oauth_error"
  | "oauth_initiate_page_loaded"
  | "oauth_initiate_start"
  | "oauth_initiate_error"
  | "oauth_return_page_loaded"
  | "oauth_return_redirect_profile"
  | "profile_provider_params_detected"
  | "profile_oauth_start"
  | "profile_oauth_error"
  | "app_oauth_detected";

type LogArgs = {
  stage: AuthDebugStage;
  provider?: AuthDebugProvider;
  error?: unknown;
  metadata?: Record<string, unknown>;
};

function safeErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Writes auth debug events to the database.
 *
 * - INSERT is allowed for everyone but constrained by RLS.
 * - SELECT is admin-only.
 *
 * Never throw from here; auth flow must continue.
 */
export async function logAuthDebugEvent(args: LogArgs) {
  try {
    const {
      stage,
      provider,
      metadata = {},
      error,
    } = args;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id ?? null;

    await supabase.from("auth_debug_events").insert([
      {
        stage,
        provider: provider ?? null,
        url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        error_message: safeErrorMessage(error),
        metadata: metadata as any,
        user_id: userId,
      },
    ]);
  } catch {
    // Intentionally swallow.
  }
}
