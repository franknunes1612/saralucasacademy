import { useLocation, useNavigate } from "react-router-dom";
import { Home, GraduationCap, Utensils, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  icon: typeof Home;
  label: { pt: string; en: string };
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", icon: Home, label: { pt: "Início", en: "Home" } },
  { path: "/learn", icon: GraduationCap, label: { pt: "Aprender", en: "Learn" } },
  { path: "/tools", icon: Utensils, label: { pt: "Ferramentas", en: "Tools" } },
  { path: "/profile", icon: User, label: { pt: "Perfil", en: "Profile" } },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/scan")) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="bg-warm-white/95 backdrop-blur-md border-t border-sand mx-0 px-2 py-2 flex items-center justify-around shadow-lg">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-espresso-mid hover:text-primary"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className="text-[11px] font-medium">{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
