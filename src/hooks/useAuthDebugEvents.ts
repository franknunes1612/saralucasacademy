import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuthDebugEvent = {
  id: string;
  created_at: string;
  provider: string | null;
  stage: string;
  url: string | null;
  user_agent: string | null;
  error_message: string | null;
  metadata: any;
  user_id: string | null;
};

export function useAuthDebugEvents(limit = 50) {
  return useQuery({
    queryKey: ["auth-debug-events", limit],
    queryFn: async (): Promise<AuthDebugEvent[]> => {
      const { data, error } = await supabase
        .from("auth_debug_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as AuthDebugEvent[];
    },
    refetchInterval: 5000,
  });
}
