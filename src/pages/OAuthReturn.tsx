import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logAuthDebugEvent } from "@/lib/authDebug";

/**
 * OAuth intermediary handler.
 *
 * Some providers return to an internal /~oauth/* route first.
 * If we render Home here, users perceive a "bounce" back to the main screen.
 * Instead, redirect to the Profile screen (auth entry point).
 */
export default function OAuthReturn() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    void logAuthDebugEvent({
      stage: "oauth_return_page_loaded",
      metadata: { search: location.search, hash: location.hash?.slice(0, 80) },
    });

    // Keep any query/hash in case downstream logic wants to read it.
    // Also add direct=1 so entry flow (splash/onboarding) is skipped.
    const search = location.search || "";
    const hash = location.hash || "";

    // If the provider already sent us back with code/token params, keep them.
    // Put direct=1 first to avoid being dropped by some redirects.
    const params = new URLSearchParams(search);
    params.set("direct", "1");

    void logAuthDebugEvent({
      stage: "oauth_return_redirect_profile",
      metadata: { to: "/profile", search: params.toString() },
    });

    navigate(`/profile?${params.toString()}${hash}`, { replace: true });
  }, [location.hash, location.search, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
    </div>
  );
}
