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
  {
    path: "/",
    icon: Home,
    label: { pt: "Início", en: "Home" },
  },
  {
    path: "/learn",
    icon: GraduationCap,
    label: { pt: "Aprender", en: "Learn" },
  },
  {
    path: "/tools",
    icon: Utensils,
    label: { pt: "Ferramentas", en: "Tools" },
  },
  {
    path: "/profile",
    icon: User,
    label: { pt: "Perfil", en: "Profile" },
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Hide on admin pages and scan/camera mode
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/scan")) {
    return null;
  }

  // Check if current path matches nav item
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="glass-card mx-3 mb-3 px-2 py-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200",
                active
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className="text-[11px] font-semibold">{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
