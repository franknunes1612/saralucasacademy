import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center gap-0.5 rounded-lg bg-white/10 p-0.5", className)}>
      <button
        onClick={() => setLanguage("pt")}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded-md transition-all",
          language === "pt"
            ? "bg-primary text-white shadow-sm"
            : "text-white/60 hover:text-white/80"
        )}
      >
        PT
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded-md transition-all",
          language === "en"
            ? "bg-primary text-white shadow-sm"
            : "text-white/60 hover:text-white/80"
        )}
      >
        EN
      </button>
    </div>
  );
}
