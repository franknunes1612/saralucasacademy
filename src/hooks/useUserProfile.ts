import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no profile exists, create one
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0],
            avatar_url: user.user_metadata?.avatar_url,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as UserProfile;
      }

      return data as UserProfile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile rarely changes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<UserProfile, "display_name" | "avatar_url">>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}
