import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Apple, Mail, ArrowLeft } from "lucide-react";
import { logAuthDebugEvent } from "@/lib/authDebug";
import { buildLovableInitiateUrl, getLovableProjectId, LovableOAuthProvider } from "@/lib/lovableOAuth";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const projectId = getLovableProjectId();
      const redirectUri = `${window.location.origin}/profile?direct=1`;

      void logAuthDebugEvent({
        stage: "authmodal_oauth_start",
        provider: "google",
        metadata: { redirect_uri: redirectUri, project_id: projectId },
      });

      sessionStorage.setItem("sara-lucas-oauth-skip-entry-flow", "1");

      // Deterministic hard redirect to the broker, always including project_id.
      const brokerUrl = buildLovableInitiateUrl({
        provider: "google" as LovableOAuthProvider,
        redirectUri,
        projectId,
      });

      window.location.assign(brokerUrl);
      return;
    } catch (error: any) {
      void logAuthDebugEvent({
        stage: "authmodal_oauth_error",
        provider: "google",
        error,
      });
      console.error("[OAuth] Google sign-in error:", error);
      toast({
        title: t({ pt: "Erro no Login Google", en: "Google Login Error" }),
        description: error.message || t({ pt: "Erro ao iniciar sessão com Google. Tenta novamente.", en: "Error signing in with Google. Please try again." }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const projectId = getLovableProjectId();
      const redirectUri = `${window.location.origin}/profile?direct=1`;

      void logAuthDebugEvent({
        stage: "authmodal_oauth_start",
        provider: "apple",
        metadata: { redirect_uri: redirectUri, project_id: projectId },
      });

      sessionStorage.setItem("sara-lucas-oauth-skip-entry-flow", "1");

      // Deterministic hard redirect to the broker, always including project_id.
      const brokerUrl = buildLovableInitiateUrl({
        provider: "apple" as LovableOAuthProvider,
        redirectUri,
        projectId,
      });

      window.location.assign(brokerUrl);
      return;
    } catch (error: any) {
      void logAuthDebugEvent({
        stage: "authmodal_oauth_error",
        provider: "apple",
        error,
      });
      console.error("[OAuth] Apple sign-in error:", error);
      toast({
        title: t({ pt: "Erro no Login Apple", en: "Apple Login Error" }),
        description: error.message || t({ pt: "Erro ao iniciar sessão com Apple. Tenta novamente.", en: "Error signing in with Apple. Please try again." }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: t({ pt: "Conta criada!", en: "Account created!" }),
          description: t({
            pt: "Verifica o teu email para confirmar a conta.",
            en: "Check your email to confirm your account.",
          }),
        });
        onOpenChange(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: t({ pt: "Bem-vindo!", en: "Welcome!" }),
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: t({ pt: "Erro", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      toast({
        title: t({ pt: "Email enviado!", en: "Email sent!" }),
        description: t({
          pt: "Verifica o teu email para redefinir a palavra-passe.",
          en: "Check your email to reset your password.",
        }),
      });
      setMode("login");
      setEmail("");
    } catch (error: any) {
      toast({
        title: t({ pt: "Erro", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
  };

  const switchMode = (newMode: "login" | "signup" | "forgot") => {
    setMode(newMode);
    resetForm();
  };

  const getTitle = () => {
    switch (mode) {
      case "forgot":
        return t({ pt: "Recuperar Palavra-passe", en: "Reset Password" });
      case "signup":
        return t({ pt: "Criar Conta", en: "Create Account" });
      default:
        return t({ pt: "Entrar", en: "Sign In" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 text-white max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {getTitle()}
          </DialogTitle>
          {mode === "forgot" && (
            <DialogDescription className="text-center text-white/60">
              {t({
                pt: "Insere o teu email e enviaremos um link para redefinir a tua palavra-passe.",
                en: "Enter your email and we'll send you a link to reset your password.",
              })}
            </DialogDescription>
          )}
        </DialogHeader>

        {mode === "forgot" ? (
          /* Password Reset Form */
          <div className="space-y-4 pt-2">
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-white/80 text-sm">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t({ pt: "Enviar Link", en: "Send Reset Link" })
                )}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="flex items-center justify-center gap-2 w-full text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t({ pt: "Voltar ao login", en: "Back to login" })}
            </button>
          </div>
        ) : (
          /* Login/Signup Forms */
          <div className="space-y-3 pt-2">
            {/* Google & Apple Sign In temporarily disabled – PROJECT_NOT_FOUND on oauth broker */}
            {/*
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 flex items-center justify-center gap-2 border border-gray-200"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {t({ pt: "Continuar com Google", en: "Continue with Google" })}
            </Button>

            <Button
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full bg-black hover:bg-black/80 text-white flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Apple className="h-5 w-5" />
              )}
              {t({ pt: "Continuar com Apple", en: "Continue with Apple" })}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-white/50">
                  {t({ pt: "ou", en: "or" })}
                </span>
              </div>
            </div>
            */}

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-white/80 text-sm">
                    {t({ pt: "Nome", en: "Name" })}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t({ pt: "O teu nome", en: "Your name" })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white/80 text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/80 text-sm">
                    {t({ pt: "Palavra-passe", en: "Password" })}
                  </Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      {t({ pt: "Esqueceste?", en: "Forgot?" })}
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {mode === "login"
                      ? t({ pt: "Entrar", en: "Sign In" })
                      : t({ pt: "Criar Conta", en: "Create Account" })}
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <p className="text-center text-sm text-white/60">
              {mode === "login" ? (
                <>
                  {t({ pt: "Não tens conta?", en: "Don't have an account?" })}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    {t({ pt: "Criar conta", en: "Sign up" })}
                  </button>
                </>
              ) : (
                <>
                  {t({ pt: "Já tens conta?", en: "Already have an account?" })}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    {t({ pt: "Entrar", en: "Sign in" })}
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
