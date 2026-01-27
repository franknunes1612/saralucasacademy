import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

// Maximum time to wait for auth resolution (ms)
const AUTH_TIMEOUT = 5000;

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [authTimedOut, setAuthTimedOut] = useState(false);

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    if (!isLoading) return;
    
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("[AdminAuthGuard] Auth resolution timed out");
        setAuthTimedOut(true);
      }
    }, AUTH_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // If auth timed out, show error
  if (authTimedOut && isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            {t({ pt: "Erro de Autenticação", en: "Authentication Error" })}
          </h1>
        </div>
        <div className="result-card p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <p className="text-white/70 mb-4">
            {t({
              pt: "Não foi possível verificar a autenticação.",
              en: "Could not verify authentication.",
            })}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="py-3 px-6 btn-primary rounded-xl font-semibold"
          >
            {t({ pt: "Tentar novamente", en: "Try again" })}
          </button>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">
            {t({ pt: "A verificar permissões...", en: "Checking permissions..." })}
          </p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    // Use effect to handle redirect to avoid render issues
    return (
      <RedirectToLogin />
    );
  }

  // Show access denied if not admin (non-blocking)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            {t({ pt: "Acesso Restrito", en: "Restricted Access" })}
          </h1>
        </div>
        <div className="result-card p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <p className="text-white/70 mb-2">
            {t({
              pt: "Não tem permissões de administrador.",
              en: "You don't have admin permissions.",
            })}
          </p>
          <p className="text-xs text-white/50 mb-6">
            {t({
              pt: "Contacte o administrador para obter acesso.",
              en: "Contact the administrator for access.",
            })}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="py-3 btn-primary rounded-xl font-semibold"
            >
              {t({ pt: "Voltar ao início", en: "Go to Home" })}
            </button>
            <button
              onClick={() => signOut()}
              className="py-3 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/15 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t({ pt: "Sair", en: "Sign out" })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin - render children
  return <>{children}</>;
}

// Separate component to handle redirect with useEffect
function RedirectToLogin() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/admin", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}
