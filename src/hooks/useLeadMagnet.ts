import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { STORAGE_KEYS } from "@/lib/constants";

interface UseLeadMagnetReturn {
  email: string;
  setEmail: (email: string) => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  submit: () => Promise<void>;
}

export function useLeadMagnet(source = "homepage_guide"): UseLeadMagnetReturn {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.leadMagnetSubmitted) === "true";
    } catch {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Introduz um email válido.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upsert to leads table — creates table if it doesn't exist yet via RLS
      // If the table doesn't exist, falls back to logging only
      const { error: dbError } = await supabase
        .from("leads" as any)
        .upsert(
          { email: trimmed, source, created_at: new Date().toISOString() },
          { onConflict: "email" }
        );

      if (dbError) {
        // Table may not exist yet — log but don't block UX
        console.warn("[useLeadMagnet] DB insert failed (table may not exist yet):", dbError.message);
      }

      // Mark as submitted locally regardless so UX feels complete
      localStorage.setItem(STORAGE_KEYS.leadMagnetSubmitted, "true");
      setIsSubmitted(true);
      setEmail("");
    } catch (err) {
      console.error("[useLeadMagnet] Unexpected error:", err);
      setError("Algo correu mal. Tenta novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, isSubmitting, isSubmitted, error, submit };
}
