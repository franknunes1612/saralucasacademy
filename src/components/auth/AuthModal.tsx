import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Apple, Mail } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
  };

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 text-white max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {mode === "login"
              ? t({ pt: "Entrar", en: "Sign In" })
              : t({ pt: "Criar Conta", en: "Create Account" })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Apple Sign In */}
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
              <Label htmlFor="password" className="text-white/80 text-sm">
                {t({ pt: "Palavra-passe", en: "Password" })}
              </Label>
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
      </DialogContent>
    </Dialog>
  );
}
