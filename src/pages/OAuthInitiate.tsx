import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logAuthDebugEvent } from "@/lib/authDebug";

/**
 * Handles Lovable Cloud OAuth initiation route.
 *
 * When accessed from a custom domain (e.g., saralucas.pt), the OAuth broker
 * at oauth.lovable.app requires the project_id to identify the project.
 * We must ensure project_id is always passed in the redirect URL.
 */
export default function OAuthInitiate() {
  const location = useLocation();

  useEffect(() => {
    void logAuthDebugEvent({
      stage: "oauth_initiate_page_loaded",
      metadata: { search: location.search },
    });

    // Ensure entry flow is skipped after return.
    sessionStorage.setItem("sara-lucas-oauth-skip-entry-flow", "1");

    // Parse existing params
    const existingParams = new URLSearchParams(location.search);
    
    // Get project_id from environment or existing params
    const projectId = existingParams.get("project_id") || import.meta.env.VITE_SUPABASE_PROJECT_ID;
    
    if (!projectId) {
      void logAuthDebugEvent({
        stage: "oauth_initiate_error",
        error: new Error("project_id is missing"),
        metadata: { search: location.search },
      });
      // Redirect to home with error
      window.location.replace("/?auth_error=project_id_missing");
      return;
    }

    // Ensure project_id is set in the params
    existingParams.set("project_id", projectId);
    
    // Construct the broker URL with all params including project_id
    const brokerUrl = `https://oauth.lovable.app/initiate?${existingParams.toString()}`;

    void logAuthDebugEvent({
      stage: "oauth_initiate_start",
      metadata: { brokerUrl, projectId },
    });

    // Hard redirect (do not use navigate) so we leave the SPA.
    window.location.replace(brokerUrl);
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
    </div>
  );
}
