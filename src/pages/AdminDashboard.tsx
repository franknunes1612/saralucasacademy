import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LogOut, ChefHat, FileText, Sparkles, ShoppingBag, Heart, CreditCard, MessageCircle, Play, MessageSquareQuote, Store, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  const adminSections = [
    {
      title: { pt: "Academia", en: "Academy" },
      description: { pt: "Ebooks, cursos e programas", en: "Ebooks, courses and programs" },
      icon: Sparkles,
      path: "/admin/academy",
      color: "bg-purple-500/20 text-purple-400",
    },
    {
      title: { pt: "Compras / Acessos", en: "Purchases / Access" },
      description: { pt: "Gerir acessos aos cursos", en: "Manage course access" },
      icon: CreditCard,
      path: "/admin/purchases",
      color: "bg-emerald-500/20 text-emerald-400",
    },
    {
      title: { pt: "Receitas", en: "Recipes" },
      description: { pt: "Gerir receitas da aplicação", en: "Manage app recipes" },
      icon: ChefHat,
      path: "/admin/recipes",
      color: "bg-orange-500/20 text-orange-400",
    },
    {
      title: { pt: "Ofertas Premium", en: "Premium Offers" },
      description: { pt: "Planos e serviços premium", en: "Premium plans and services" },
      icon: Crown,
      path: "/admin/premium",
      color: "bg-yellow-500/20 text-yellow-400",
    },
    {
      title: { pt: "Loja / Produtos", en: "Store / Products" },
      description: { pt: "Gerir produtos vendidos na app", en: "Manage products sold in app" },
      icon: ShoppingBag,
      path: "/admin/store",
      color: "bg-green-500/20 text-green-400",
    },
    {
      title: { pt: "Produtos Favoritos", en: "Favorite Products" },
      description: { pt: "Produtos externos recomendados", en: "External recommended products" },
      icon: Heart,
      path: "/admin/recommended-products",
      color: "bg-pink-500/20 text-pink-400",
    },
    {
      title: { pt: "Conteúdo CMS", en: "CMS Content" },
      description: { pt: "Editar textos e labels", en: "Edit texts and labels" },
      icon: FileText,
      path: "/admin/cms",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      title: { pt: "Suporte", en: "Support" },
      description: { pt: "Ver mensagens de suporte", en: "View support messages" },
      icon: MessageCircle,
      path: "/admin/support",
      color: "bg-cyan-500/20 text-cyan-400",
    },
    {
      title: { pt: "Onboarding", en: "Onboarding" },
      description: { pt: "Gerir slides de boas-vindas", en: "Manage welcome slides" },
      icon: Play,
      path: "/admin/onboarding",
      color: "bg-amber-500/20 text-amber-400",
    },
    {
      title: { pt: "Testemunhos", en: "Testimonials" },
      description: { pt: "Gerir testemunhos de clientes", en: "Manage customer testimonials" },
      icon: MessageSquareQuote,
      path: "/admin/testimonials",
      color: "bg-rose-500/20 text-rose-400",
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
