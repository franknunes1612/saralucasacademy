import { useLocation, useNavigate } from "react-router-dom";
import { Home, GraduationCap, Utensils, User, ScanLine } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  icon: typeof Home;
  label: { pt: string; en: string };
}

const LEFT_NAV: NavItem[] = [
  { path: "/", icon: Home, label: { pt: "Início", en: "Home" } },
  { path: "/learn", icon: GraduationCap, label: { pt: "Aprender", en: "Learn" } },
];

const RIGHT_NAV: NavItem[] = [
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

  const isScanActive = location.pathname === "/scan";

  const NavButton = ({ item }: { item: NavItem }) => {
    const active = isActive(item.path);
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={cn(
          "flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-all duration-200 flex-1",
          active ? "bg-primary/10 text-primary" : "text-espresso-mid hover:text-primary"
        )}
      >
        <item.icon className={cn("h-5 w-5", active && "scale-110")} />
        <span className="text-xs font-medium">{t(item.label)}</span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="bg-warm-white/95 backdrop-blur-md border-t border-sand mx-0 px-2 py-2 flex items-center justify-around shadow-lg">

        {LEFT_NAV.map((item) => <NavButton key={item.path} item={item} />)}

        {/* Centre scanner button — elevated above the nav bar */}
        <div className="relative flex flex-col items-center -mt-7 px-1">
          <button
            onClick={() => navigate("/scan?direct=1")}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95",
              isScanActive
                ? "bg-terracotta-dark shadow-md scale-95"
                : "bg-primary shadow-[0_4px_20px_hsl(20_52%_53%/0.45)] hover:bg-terracotta-dark"
            )}
            aria-label={t({ pt: "Scanner de Alimentos", en: "Food Scanner" })}
          >
            <ScanLine className="h-6 w-6 text-white" />
          </button>
          <span className="text-[11px] font-medium text-primary mt-0.5">
            {t({ pt: "Scan", en: "Scan" })}
          </span>
        </div>

        {RIGHT_NAV.map((item) => <NavButton key={item.path} item={item} />)}
      </div>
    </nav>
  );
}
