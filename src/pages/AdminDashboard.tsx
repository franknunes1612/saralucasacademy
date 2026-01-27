import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LogOut, ChefHat, FileText, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-white/60">
          {t({ pt: "A verificar...", en: "Checking..." })}
        </div>
      </div>
    );
  }

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
            {t({ pt: "Acesso Negado", en: "Access Denied" })}
          </h1>
        </div>
        <div className="result-card p-6 text-center">
          <p className="text-white/70 mb-4">
            {t({
              pt: "Não tem permissões de administrador.",
              en: "You don't have admin permissions.",
            })}
          </p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  const adminSections = [
    {
      title: { pt: "Receitas", en: "Recipes" },
      description: { pt: "Gerir receitas da aplicação", en: "Manage app recipes" },
      icon: ChefHat,
      path: "/admin/recipes",
      color: "bg-orange-500/20 text-orange-400",
    },
    {
      title: { pt: "Conteúdo CMS", en: "CMS Content" },
      description: { pt: "Editar textos e labels", en: "Edit texts and labels" },
      icon: FileText,
      path: "/admin/cms",
      color: "bg-blue-500/20 text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t({ pt: "Painel Admin", en: "Admin Panel" })}
            </h1>
            <p className="text-xs text-white/60">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          title={t({ pt: "Sair", en: "Sign out" })}
        >
          <LogOut className="h-5 w-5 text-white/60" />
        </button>
      </div>

      {/* Admin Sections */}
      <div className="space-y-4">
        {adminSections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="result-card p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
          >
            <div className={`p-3 rounded-xl ${section.color}`}>
              <section.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-white">
                {t(section.title)}
              </h2>
              <p className="text-sm text-white/60">
                {t(section.description)}
              </p>
            </div>
            <ArrowLeft className="h-5 w-5 text-white/30 rotate-180" />
          </Link>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/70">
          {t({
            pt: "As alterações são aplicadas imediatamente. Não é necessário reimplantar a aplicação.",
            en: "Changes are applied immediately. No need to redeploy the app.",
          })}
        </p>
      </div>
    </div>
  );
}
