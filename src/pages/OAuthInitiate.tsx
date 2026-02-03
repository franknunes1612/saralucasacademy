import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logAuthDebugEvent } from "@/lib/authDebug";

/**
 * Handles Lovable Cloud OAuth initiation route.
 *
 * In production, the initiate route is supposed to 302 to the Lovable OAuth broker.
 * On SPA hosting, it may fall back to index.html. In that case we must perform
 * the redirect ourselves, otherwise users get stuck here and never authenticate.
 *
 * IMPORTANT: Do NOT call lovable.auth.signInWithOAuth() from here.
 * createLovableAuth (non-iframe) already navigated to /~oauth/initiate; calling it
 * again causes an infinite refresh loop.
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

    // Redirect to the real broker.
    const brokerUrl = `https://oauth.lovable.app/initiate${location.search || ""}`;

    void logAuthDebugEvent({
      stage: "oauth_initiate_start",
      metadata: { brokerUrl },
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
