import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdminLoading: boolean;
  isAdmin: boolean;
}

// Cache admin status in sessionStorage with expiry
const ADMIN_CACHE_KEY = "auth_admin_cache";
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface AdminCache {
  userId: string;
  isAdmin: boolean;
  timestamp: number;
}

function getCachedAdminStatus(userId: string): boolean | null {
  try {
    const cached = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (!cached) return null;
    
    const data: AdminCache = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > ADMIN_CACHE_TTL;
    const isSameUser = data.userId === userId;
    
    if (isExpired || !isSameUser) {
      sessionStorage.removeItem(ADMIN_CACHE_KEY);
      return null;
    }
    
    return data.isAdmin;
  } catch {
    return null;
  }
}

function setCachedAdminStatus(userId: string, isAdmin: boolean): void {
  try {
    const data: AdminCache = {
      userId,
      isAdmin,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearAdminCache(): void {
  try {
    sessionStorage.removeItem(ADMIN_CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdminLoading: true,
    isAdmin: false,
  });
  
  // Track if we've already verified admin for this session
  const adminVerifiedRef = useRef<string | null>(null);

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    // Check cache first
    const cached = getCachedAdminStatus(userId);
    if (cached !== null) {
      console.log("[Auth] Using cached admin status:", cached);
      return cached;
    }
    
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (error) {
        console.error("[Auth] Check admin role error:", error);
        return false;
      }

      const isAdmin = data === true;
      setCachedAdminStatus(userId, isAdmin);
      return isAdmin;
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

  // Claim any pending guest purchases for the user
  const claimGuestPurchases = useCallback(async (accessToken: string) => {
    try {
      const response = await supabase.functions.invoke("claim-guest-purchases", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.error) {
        console.error("[Auth] Claim guest purchases error:", response.error);
        return;
      }

      const data = response.data;
      if (data?.claimed && data.claimed > 0) {
        toast.success(data.message || `Access granted to ${data.claimed} course(s)!`);
      }
    } catch (err) {
      console.error("[Auth] Claim guest purchases exception:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Helper to resolve admin status with timeout
    const resolveAdminStatus = async (userId: string, email: string): Promise<boolean> => {
      try {
        // Reduced timeout to 3 seconds to improve perceived performance
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => {
            console.warn("[Auth] Admin check timed out");
            resolve(false);
          }, 3000);
        });

        const adminCheckPromise = (async () => {
          // Run bootstrap and check in parallel instead of sequentially
          const [, isAdmin] = await Promise.all([
            bootstrapAdminRole(userId, email),
            checkAdminRole(userId),
          ]);
          return isAdmin;
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

        // Skip admin check if already verified for this user
        if (user && user.email && session?.access_token) {
          // Check if we already verified this user in this session
          if (adminVerifiedRef.current === user.id) {
            const cached = getCachedAdminStatus(user.id);
            if (cached !== null) {
              if (isMounted) {
                setState(prev => ({
                  ...prev,
                  isAdmin: cached,
                  isAdminLoading: false,
                }));
              }
              // Still claim guest purchases
              claimGuestPurchases(session.access_token);
              return;
            }
          }
          
          // Run admin check and guest purchase claim in parallel
          const [isAdmin] = await Promise.all([
            resolveAdminStatus(user.id, user.email),
            claimGuestPurchases(session.access_token),
          ]);
          if (isMounted) {
            adminVerifiedRef.current = user.id;
            setState(prev => ({
              ...prev,
              isAdmin,
              isAdminLoading: false,
            }));
          }
        } else {
          if (isMounted) {
            adminVerifiedRef.current = null;
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

      // Check admin role and claim guest purchases on initial load
      if (user && user.email && session?.access_token) {
        // Check cache first for instant admin status
        const cached = getCachedAdminStatus(user.id);
        if (cached !== null) {
          adminVerifiedRef.current = user.id;
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isAdmin: cached,
              isAdminLoading: false,
            }));
          }
          // Still claim guest purchases in background
          claimGuestPurchases(session.access_token);
          return;
        }
        
        const [isAdmin] = await Promise.all([
          resolveAdminStatus(user.id, user.email),
          claimGuestPurchases(session.access_token),
        ]);
        if (isMounted) {
          adminVerifiedRef.current = user.id;
          setState(prev => ({
            ...prev,
            isAdmin,
            isAdminLoading: false,
          }));
        }
      } else {
        if (isMounted) {
          adminVerifiedRef.current = null;
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
  }, [checkAdminRole, bootstrapAdminRole, claimGuestPurchases]);

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
      // Clear admin cache on logout
      clearAdminCache();
      adminVerifiedRef.current = null;
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
