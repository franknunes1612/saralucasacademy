export type LovableOAuthProvider = "google" | "apple";

// NOTE: project_id is not a secret; it's required by oauth.lovable.app to route the request.
// We keep a hard fallback to avoid production builds where env injection fails.
const FALLBACK_PROJECT_ID = "zkwgkifnidklaiemkesp";

export function getLovableProjectId(): string {
  const fromEnv = (import.meta as any)?.env?.VITE_SUPABASE_PROJECT_ID as string | undefined;
  return (fromEnv && fromEnv.trim()) || FALLBACK_PROJECT_ID;
}

function randomState(): string {
  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // Very old browsers: fallback to Math.random
    return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  }
}

export function buildLovableInitiateUrl(args: {
  provider: LovableOAuthProvider;
  redirectUri: string;
  projectId?: string;
}): string {
  const projectId = args.projectId ?? getLovableProjectId();
  const params = new URLSearchParams();
  params.set("provider", args.provider);
  params.set("redirect_uri", args.redirectUri);
  params.set("project_id", projectId);
  params.set("state", randomState());

  return `https://oauth.lovable.app/initiate?${params.toString()}`;
}
