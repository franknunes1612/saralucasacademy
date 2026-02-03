// Lovable Cloud authentication module.
// Custom configuration to fix project_id requirement for custom domains.

import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";

// Get project ID from environment
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

// Create auth instance with custom broker URL that includes project_id
const lovableAuth = createLovableAuth({
  oauthBrokerUrl: `/~oauth/initiate`,
});

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: { redirect_uri?: string; extraParams?: Record<string, string> }) => {
      // Ensure project_id is always passed
      const extraParams = {
        ...opts?.extraParams,
        project_id: PROJECT_ID,
      };

      const result = await lovableAuth.signInWithOAuth(provider, {
        ...opts,
        extraParams,
      });

      if (result.redirected) {
        return result;
      }

      if (result.error) {
        return result;
      }

      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    },
  },
};
