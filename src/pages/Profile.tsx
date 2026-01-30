import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  FileText, 
  MessageCircle,
  ChevronRight,
  LogOut,
  Shield
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  id: string;
  icon: typeof User;
  title: { pt: string; en: string };
  action: () => void;
  danger?: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/351939535077", "_blank", "noopener,noreferrer");
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
      action: () => {},
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

      {/* User Card */}
      <div className="result-card p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            {user ? (
              <>
                <h2 className="font-semibold text-white">{user.email}</h2>
                <p className="text-sm text-white/60">
                  {isAdmin
                    ? t({ pt: "Administrador", en: "Administrator" })
                    : t({ pt: "Membro", en: "Member" })}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-semibold text-white">
                  {t({ pt: "Visitante", en: "Guest" })}
                </h2>
                <p className="text-sm text-white/60">
                  {t({ pt: "Navegar livremente", en: "Browse freely" })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
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
      </div>

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
