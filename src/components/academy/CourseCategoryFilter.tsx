import { motion } from "framer-motion";
import { Dumbbell, Apple, Calendar, Sparkles, GraduationCap, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  icon: typeof Dumbbell;
  label: { pt: string; en: string };
}

const CATEGORIES: Category[] = [
  { id: "all", icon: Sparkles, label: { pt: "Todos", en: "All" } },
  { id: "training", icon: Dumbbell, label: { pt: "Treino", en: "Training" } },
  { id: "nutrition", icon: Apple, label: { pt: "Nutrição", en: "Nutrition" } },
  { id: "programs", icon: Calendar, label: { pt: "Programas", en: "Programs" } },
  { id: "beginner", icon: GraduationCap, label: { pt: "Iniciantes", en: "Beginners" } },
  { id: "advanced", icon: Zap, label: { pt: "Avançado", en: "Advanced" } },
];

interface CourseCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CourseCategoryFilter({
  activeCategory,
  onCategoryChange,
}: CourseCategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-white/70 mb-3 px-1">
        {t({ pt: "Categorias", en: "Categories" })}
      </h2>
      
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {CATEGORIES.map((category, index) => {
          const isActive = activeCategory === category.id;
          const Icon = category.icon;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-white text-[hsl(340_45%_45%)] shadow-md"
                  : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[hsl(340_45%_50%)]" : "text-white/60")} />
              <span>{t(category.label)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
