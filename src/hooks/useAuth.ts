import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      return !error && data !== null;
    } catch {
      return false;
    }
  }, []);

  const bootstrapAdminRole = useCallback(async (userId: string, email: string) => {
    try {
      // Call the database function to auto-assign admin role based on email whitelist
      const { data, error } = await supabase.rpc("bootstrap_admin_role", {
        _user_id: userId,
        _email: email,
      });

      if (error) {
        console.error("[Auth] Bootstrap admin role error:", error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error("[Auth] Bootstrap admin role exception:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let isAdmin = false;

        if (user && user.email) {
          // First, try to bootstrap admin role based on email whitelist
          await bootstrapAdminRole(user.id, user.email);
          
          // Then check if user has admin role
          isAdmin = await checkAdminRole(user.id);
        }

        setState({
          user,
          session,
          isLoading: false,
          isAdmin,
        });
      }
    );

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      let isAdmin = false;

      if (user && user.email) {
        // First, try to bootstrap admin role based on email whitelist
        await bootstrapAdminRole(user.id, user.email);
        
        // Then check if user has admin role
        isAdmin = await checkAdminRole(user.id);
      }

      setState({
        user,
        session,
        isLoading: false,
        isAdmin,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminRole, bootstrapAdminRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
      });
    }
    return { error };
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
}
