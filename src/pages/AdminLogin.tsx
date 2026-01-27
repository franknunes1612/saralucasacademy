import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signIn, signUp, isLoading: authLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = authSchema.parse({ email, password });

      if (isSignUp) {
        const { error } = await signUp(validated.email, validated.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(
            t({
              pt: "Conta criada! Verifique seu email.",
              en: "Account created! Check your email.",
            })
          );
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(validated.email, validated.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(t({ pt: "Login efetuado!", en: "Logged in!" }));
          // Small delay to allow auth state to update and role to bootstrap
          await new Promise((resolve) => setTimeout(resolve, 500));
          navigate("/admin/dashboard");
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t({ pt: "Admin Login", en: "Admin Login" })}
          </h1>
          <p className="text-xs text-white/60">
            {t({ pt: "Acesso restrito", en: "Restricted access" })}
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="result-card p-4 space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@example.com"
                required
                maxLength={255}
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Senha", en: "Password" })}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
                minLength={6}
                maxLength={100}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="w-full py-4 btn-primary rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSignUp ? (
              <>
                <UserPlus className="h-5 w-5" />
                {t({ pt: "Criar conta", en: "Create account" })}
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                {t({ pt: "Entrar", en: "Sign in" })}
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 py-3 text-sm text-white/60 hover:text-white transition-colors"
        >
          {isSignUp
            ? t({ pt: "Já tem conta? Faça login", en: "Have an account? Sign in" })
            : t({ pt: "Não tem conta? Crie uma", en: "No account? Create one" })}
        </button>

        <p className="mt-6 text-xs text-white/40 text-center">
          {t({
            pt: "Apenas administradores podem gerir receitas.",
            en: "Only admins can manage recipes.",
          })}
        </p>
      </div>
    </div>
  );
}
