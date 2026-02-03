import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Shield,
  HelpCircle,
  MessageCircle,
  FileText,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Video,
  Users,
  Package
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPurchases } from "@/hooks/useUserPurchases";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { logAuthDebugEvent } from "@/lib/authDebug";

const OAUTH_SKIP_ENTRY_FLOW_KEY = "sara-lucas-oauth-skip-entry-flow";

interface MenuItem {
  id: string;
  icon: typeof User;
  title: { pt: string; en: string };
  action: () => void;
  danger?: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  // Only use isLoading for initial auth check, not isAdminLoading
  // This prevents the page from blocking while admin role is being verified
  const { user, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: purchases, isLoading: purchasesLoading } = useUserPurchases();

  // Audit/debug: capture when we land here with OAuth-related params.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const provider = params.get("provider");
    const redirectUri = params.get("redirect_uri");
    const hasCode = params.has("code");
    const hasAccessToken = params.has("access_token") || location.hash.includes("access_token=");

    if (provider || hasCode || hasAccessToken) {
      void logAuthDebugEvent({
        stage: "profile_provider_params_detected",
        provider: provider === "google" || provider === "apple" ? provider : undefined,
        metadata: {
          search: location.search,
          hasCode,
          hasAccessToken,
          redirect_uri: redirectUri,
        },
      });
    }

    // Root-cause fix: once the session exists, do NOT keep the user on /profile.
    // Only do this when /profile is being used as an OAuth return landing.
    if (user && (provider || hasCode || hasAccessToken)) {
      navigate("/", { replace: true });
    }
  }, [location.hash, location.search, navigate, user]);
  
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/351939535077", "_blank", "noopener,noreferrer");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (authTab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(t({ pt: "Sessão iniciada!", en: "Logged in!" }));
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success(t({ 
          pt: "Conta criada! Verifica o teu email.", 
          en: "Account created! Check your email." 
        }));
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      sessionStorage.setItem(OAUTH_SKIP_ENTRY_FLOW_KEY, "1");
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/profile?direct=1`,
      });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      sessionStorage.setItem(OAUTH_SKIP_ENTRY_FLOW_KEY, "1");
      const { error } = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: `${window.location.origin}/profile?direct=1`,
      });
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Apple sign-in failed";
      toast.error(message);
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: "how-it-works",
      icon: HelpCircle,
      title: { pt: "Como Funciona", en: "How It Works" },
      action: () => navigate("/how-it-works"),
    },
    {
      id: "contact",
      icon: MessageCircle,
      title: { pt: "Falar com Nutricionista", en: "Talk to Nutritionist" },
      action: handleWhatsApp,
    },
    {
      id: "terms",
      icon: FileText,
      title: { pt: "Termos de Uso", en: "Terms of Use" },
      action: () => navigate("/terms"),
    },
  ];

  if (isAdmin) {
    menuItems.unshift({
      id: "admin",
      icon: Shield,
      title: { pt: "Painel Admin", en: "Admin Panel" },
      action: () => navigate("/admin/dashboard"),
    });
  }

  if (user) {
    menuItems.push({
      id: "signout",
      icon: LogOut,
      title: { pt: "Terminar Sessão", en: "Sign Out" },
      action: handleSignOut,
      danger: true,
    });
  }

  // Only show full-page loading for initial auth state
  // After that, show content progressively to avoid blocking
  const showInitialLoading = authLoading && user === null;
  
  if (showInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t({ pt: "Perfil", en: "Profile" })}
        </h1>
      </div>

      {user ? (
        <>
          {/* User Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="result-card p-5 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                {profileLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                ) : profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-7 w-7 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-white">
                  {profileLoading ? (
                    <span className="inline-block w-32 h-5 bg-white/10 rounded animate-pulse" />
                  ) : (
                    profile?.display_name || user.email
                  )}
                </h2>
                <p className="text-sm text-white/60">
                  {isAdmin
                    ? t({ pt: "Administrador", en: "Administrator" })
                    : t({ pt: "Membro", en: "Member" })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Purchased Items - Grouped by Type */}
          {purchasesLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 space-y-2"
            >
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-3" />
              <div className="result-card p-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-white/10 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          ) : purchases && purchases.length > 0 ? (
            <>
              {/* Ebooks */}
              {purchases.filter(p => p.item_type === "ebook").length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-medium text-white/70 mb-3 px-1">
                    {t({ pt: "Meus Ebooks", en: "My Ebooks" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "ebook").map((purchase) => (
                      <button
                        key={purchase.id}
                        onClick={() => navigate(`/learn/ebook/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="p-2 rounded-xl bg-blue-500/20">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-white">
                            {language === "pt" ? purchase.title_pt : purchase.title_en}
                          </span>
                          <p className="text-xs text-white/50">
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-[hsl(155_40%_55%)]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Courses */}
              {purchases.filter(p => p.item_type === "course").length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-medium text-white/70 mb-3 px-1">
                    {t({ pt: "Meus Cursos", en: "My Courses" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "course").map((purchase) => (
                      <button
                        key={purchase.id}
                        onClick={() => navigate(`/learn/course/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="p-2 rounded-xl bg-purple-500/20">
                          <Video className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-white">
                            {language === "pt" ? purchase.title_pt : purchase.title_en}
                          </span>
                          <p className="text-xs text-white/50">
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-[hsl(155_40%_55%)]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Programs */}
              {purchases.filter(p => p.item_type === "program").length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-medium text-white/70 mb-3 px-1">
                    {t({ pt: "Meus Programas", en: "My Programs" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "program").map((purchase) => (
                      <button
                        key={purchase.id}
                        onClick={() => navigate(`/learn/program/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="p-2 rounded-xl bg-orange-500/20">
                          <Users className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-white">
                            {language === "pt" ? purchase.title_pt : purchase.title_en}
                          </span>
                          <p className="text-xs text-white/50">
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-[hsl(155_40%_55%)]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Bundles */}
              {purchases.filter(p => p.item_type === "bundle").length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-medium text-white/70 mb-3 px-1">
                    {t({ pt: "Meus Pacotes", en: "My Bundles" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "bundle").map((purchase) => (
                      <button
                        key={purchase.id}
                        onClick={() => navigate(`/learn/bundle/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="p-2 rounded-xl bg-[hsl(155_40%_45%)]/20">
                          <Package className="h-5 w-5 text-[hsl(155_40%_55%)]" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-white">
                            {language === "pt" ? purchase.title_pt : purchase.title_en}
                          </span>
                          <p className="text-xs text-white/50">
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-[hsl(155_40%_55%)]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : null}

          {/* Menu Items */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`result-card p-4 w-full flex items-center gap-4 hover:bg-white/5 transition-colors text-left ${
                  item.danger ? "border border-destructive/30" : ""
                }`}
              >
                <div className={`p-2 rounded-xl ${item.danger ? "bg-destructive/20 text-destructive" : "bg-white/10 text-white/70"}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={`flex-1 font-medium ${item.danger ? "text-destructive" : "text-white"}`}>
                  {t(item.title)}
                </span>
                <ChevronRight className={`h-5 w-5 ${item.danger ? "text-destructive/50" : "text-white/30"}`} />
              </button>
            ))}
          </motion.div>
        </>
      ) : (
        /* Auth Forms for Guests */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-white/20 font-medium"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t({ pt: "Continuar com Google", en: "Continue with Google" })}
          </Button>

          {/* Apple Sign In */}
          <Button
            onClick={handleAppleSignIn}
            variant="outline"
            className="w-full h-12 bg-black hover:bg-black/90 text-white border-0 font-medium"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {t({ pt: "Continuar com Apple", en: "Continue with Apple" })}
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/70">
              {t({ pt: "ou", en: "or" })}
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email/Password Auth */}
          <div className="result-card p-5">
            <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="login" className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  {t({ pt: "Entrar", en: "Log In" })}
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  {t({ pt: "Criar Conta", en: "Sign Up" })}
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleEmailAuth} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                    <Input
                      type="email"
                      placeholder={t({ pt: "Email", en: "Email" })}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t({ pt: "Palavra-passe", en: "Password" })}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-[hsl(340_45%_45%)] hover:bg-white/90 font-medium"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : authTab === "login" ? (
                    t({ pt: "Entrar", en: "Log In" })
                  ) : (
                    t({ pt: "Criar Conta", en: "Sign Up" })
                  )}
                </Button>
              </form>
            </Tabs>
          </div>

          {/* Guest Menu Items */}
          <div className="space-y-2">
            {menuItems.filter(item => !item.danger && item.id !== "admin").map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="result-card p-4 w-full flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="p-2 rounded-xl bg-white/10 text-white/70">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="flex-1 font-medium text-white">
                  {t(item.title)}
                </span>
                <ChevronRight className="h-5 w-5 text-white/30" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* App Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-white/40">
          Sara Lucas Academy v1.0
        </p>
        <p className="text-xs text-white/30 mt-1">
          {t({ pt: "Uma produção Sara Lucas Nutrição", en: "A Sara Lucas Nutrition production" })}
        </p>
      </div>
    </div>
  );
}
