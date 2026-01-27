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
    let isMounted = true;

    // Helper to resolve admin status with timeout
    const resolveAdminStatus = async (userId: string, email: string): Promise<boolean> => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), 3000);
        });

        const adminCheckPromise = (async () => {
          await bootstrapAdminRole(userId, email);
          return await checkAdminRole(userId);
        })();

        return await Promise.race([adminCheckPromise, timeoutPromise]);
      } catch (err) {
        console.error("[Auth] Admin status check failed:", err);
        return false;
      }
    };

    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        const user = session?.user ?? null;
        
        // Immediately update with user info, loading done
        setState(prev => ({
          ...prev,
          user,
          session,
          isLoading: false,
        }));

        // Then check admin role in background
        if (user && user.email) {
          const isAdmin = await resolveAdminStatus(user.id, user.email);
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isAdmin,
            }));
          }
        } else {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isAdmin: false,
            }));
          }
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      const user = session?.user ?? null;
      
      // Immediately update with user info
      setState(prev => ({
        ...prev,
        user,
        session,
        isLoading: false,
      }));

      // Then check admin role in background
      if (user && user.email) {
        const isAdmin = await resolveAdminStatus(user.id, user.email);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isAdmin,
          }));
        }
      }
    });

    return () => {
      isMounted = false;
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
