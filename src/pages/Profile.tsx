import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, User, Mail, Lock, Eye, EyeOff, LogOut, Shield, HelpCircle,
  MessageCircle, FileText, ChevronRight, BookOpen, CheckCircle2, Loader2,
  Video, Users, Package
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
  const { user, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: purchases, isLoading: purchasesLoading } = useUserPurchases();

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
        metadata: { search: location.search, hasCode, hasAccessToken, redirect_uri: redirectUri },
      });
    }

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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t({ pt: "Sessão iniciada!", en: "Logged in!" }));
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(t({ pt: "Conta criada! Verifica o teu email.", en: "Account created! Check your email." }));
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
    { id: "how-it-works", icon: HelpCircle, title: { pt: "Como Funciona", en: "How It Works" }, action: () => navigate("/how-it-works") },
    { id: "contact", icon: MessageCircle, title: { pt: "Marcar com nutricionista", en: "Book with nutritionist" }, action: handleWhatsApp },
    { id: "terms", icon: FileText, title: { pt: "Termos de Uso", en: "Terms of Use" }, action: () => navigate("/terms") },
  ];

  if (isAdmin) {
    menuItems.unshift({ id: "admin", icon: Shield, title: { pt: "Painel Admin", en: "Admin Panel" }, action: () => navigate("/admin/dashboard") });
  }

  if (user) {
    menuItems.push({ id: "signout", icon: LogOut, title: { pt: "Terminar Sessão", en: "Sign Out" }, action: handleSignOut, danger: true });
  }

  const showInitialLoading = authLoading && user === null;
  
  if (showInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-sm hover:bg-accent transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
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
                  <Loader2 className="h-6 w-6 animate-spin text-primary-foreground/50" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">
                  {profileLoading ? (
                    <span className="inline-block w-32 h-5 bg-muted rounded animate-pulse" />
                  ) : (
                    profile?.display_name || user.email
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isAdmin
                    ? t({ pt: "Administrador", en: "Administrator" })
                    : t({ pt: "Membro", en: "Member" })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Purchased Items */}
          {purchasesLoading ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
              <div className="result-card p-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-muted rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          ) : purchases && purchases.length > 0 ? (
            <>
              {/* Ebooks */}
              {purchases.filter(p => p.item_type === "ebook").length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                    {t({ pt: "Meus Ebooks", en: "My Ebooks" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "ebook").map((purchase) => (
                      <button key={purchase.id} onClick={() => navigate(`/learn/ebook/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:border-primary/30 transition-colors text-left">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{language === "pt" ? purchase.title_pt : purchase.title_en}</span>
                          <p className="text-xs text-muted-foreground">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Courses */}
              {purchases.filter(p => p.item_type === "course").length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                    {t({ pt: "Meus Cursos", en: "My Courses" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "course").map((purchase) => (
                      <button key={purchase.id} onClick={() => navigate(`/learn/course/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:border-primary/30 transition-colors text-left">
                        <div className="p-2 rounded-xl bg-secondary/10">
                          <Video className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{language === "pt" ? purchase.title_pt : purchase.title_en}</span>
                          <p className="text-xs text-muted-foreground">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Programs */}
              {purchases.filter(p => p.item_type === "program").length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                    {t({ pt: "Meus Programas", en: "My Programs" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "program").map((purchase) => (
                      <button key={purchase.id} onClick={() => navigate(`/learn/program/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:border-primary/30 transition-colors text-left">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{language === "pt" ? purchase.title_pt : purchase.title_en}</span>
                          <p className="text-xs text-muted-foreground">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Bundles */}
              {purchases.filter(p => p.item_type === "bundle").length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                    {t({ pt: "Meus Pacotes", en: "My Bundles" })}
                  </h3>
                  <div className="space-y-2">
                    {purchases.filter(p => p.item_type === "bundle").map((purchase) => (
                      <button key={purchase.id} onClick={() => navigate(`/learn/bundle/${purchase.course_id}`)}
                        className="result-card p-4 w-full flex items-center gap-4 hover:border-primary/30 transition-colors text-left">
                        <div className="p-2 rounded-xl bg-secondary/10">
                          <Package className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{language === "pt" ? purchase.title_pt : purchase.title_en}</span>
                          <p className="text-xs text-muted-foreground">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
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
                className={`result-card p-4 w-full flex items-center gap-4 hover:border-primary/30 transition-colors text-left ${
                  item.danger ? "border border-destructive/30" : ""
                }`}
              >
                <div className={`p-2 rounded-xl ${item.danger ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={`flex-1 font-medium ${item.danger ? "text-destructive" : "text-foreground"}`}>
                  {t(item.title)}
                </span>
                <ChevronRight className={`h-5 w-5 ${item.danger ? "text-destructive/50" : "text-muted-foreground/50"}`} />
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
          {/* Google & Apple Sign In temporarily disabled – PROJECT_NOT_FOUND on oauth broker */}
          {/*
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full h-12 bg-card hover:bg-accent text-foreground border border-border font-medium">
            Google
          </Button>
          <Button onClick={handleAppleSignIn} variant="outline" className="w-full h-12 bg-espresso hover:bg-espresso-mid text-cream border-0 font-medium">
            Apple
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t({ pt: "ou", en: "or" })}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          */}

          {/* Email/Password Auth */}
          <div className="result-card p-5">
            <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="login" className="text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground">
                  {t({ pt: "Entrar", en: "Log In" })}
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground">
                  {t({ pt: "Criar Conta", en: "Sign Up" })}
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleEmailAuth} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t({ pt: "Email", en: "Email" })}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t({ pt: "Palavra-passe", en: "Password" })}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
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
                className="result-card p-4 w-full flex items-center gap-4 hover:border-primary/30 transition-colors text-left"
              >
                <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="flex-1 font-medium text-foreground">
                  {t(item.title)}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* App Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Sara Lucas Academy v1.0
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {t({ pt: "Uma produção Sara Lucas Nutrição", en: "A Sara Lucas Nutrition production" })}
        </p>
      </div>
    </div>
  );
}
