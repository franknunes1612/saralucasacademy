import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdminLoading: boolean; // Separate loading state for admin check
  isAdmin: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdminLoading: true,
    isAdmin: false,
  });

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("[Auth] Check admin role error:", error);
        return false;
      }

      return data !== null;
    } catch (err) {
      console.error("[Auth] Check admin role exception:", err);
      return false;
    }
  }, []);

  const bootstrapAdminRole = useCallback(async (userId: string, email: string): Promise<boolean> => {
    try {
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
        // Add timeout to prevent hanging (3 seconds)
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => {
            console.warn("[Auth] Admin check timed out");
            resolve(false);
          }, 3000);
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
        
        // Update user info immediately, but keep admin loading if user exists
        setState(prev => ({
          ...prev,
          user,
          session,
          isLoading: false,
          isAdminLoading: !!user, // Only loading if there's a user to check
          isAdmin: false, // Reset admin until verified
        }));

        // Check admin role
        if (user && user.email) {
          const isAdmin = await resolveAdminStatus(user.id, user.email);
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isAdmin,
              isAdminLoading: false,
            }));
          }
        } else {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isAdmin: false,
              isAdminLoading: false,
            }));
          }
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      const user = session?.user ?? null;
      
      // Update user info immediately
      setState(prev => ({
        ...prev,
        user,
        session,
        isLoading: false,
        isAdminLoading: !!user,
        isAdmin: false,
      }));

      // Check admin role
      if (user && user.email) {
        const isAdmin = await resolveAdminStatus(user.id, user.email);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isAdmin,
            isAdminLoading: false,
          }));
        }
      } else {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isAdminLoading: false,
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
        isAdminLoading: false,
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
