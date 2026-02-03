import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";

function isProvider(v: string | null): v is "google" | "apple" {
  return v === "google" || v === "apple";
}

/**
 * Handles Lovable Cloud OAuth initiation route.
 *
 * If our SPA captures /~oauth/initiate, we must re-trigger the OAuth redirect,
 * otherwise users get stuck on this URL and never become logged in.
 */
export default function OAuthInitiate() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const provider = params.get("provider");
    const redirectUri = params.get("redirect_uri") || undefined;

    if (!isProvider(provider)) {
      // Unknown provider – return user to profile.
      navigate("/profile?direct=1", { replace: true });
      return;
    }

    // Ensure entry flow is skipped after return.
    sessionStorage.setItem("sara-lucas-oauth-skip-entry-flow", "1");

    // Fire-and-forget: this should redirect away to provider.
    void lovable.auth.signInWithOAuth(provider, {
      redirect_uri: redirectUri,
    });
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
    </div>
  );
}
