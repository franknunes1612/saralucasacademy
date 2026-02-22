import React from "react";
import { motion } from "framer-motion";
import { Dumbbell, Apple, Calendar, Sparkles, GraduationCap, Zap } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  icon: typeof Dumbbell;
  cmsKey: string;
}

const CATEGORIES: Category[] = [
  { id: "all", icon: Sparkles, cmsKey: "academy.filter.all" },
  { id: "training", icon: Dumbbell, cmsKey: "academy.categories.training" },
  { id: "nutrition", icon: Apple, cmsKey: "academy.categories.nutrition" },
  { id: "programs", icon: Calendar, cmsKey: "academy.categories.programs" },
  { id: "beginner", icon: GraduationCap, cmsKey: "academy.categories.beginners" },
  { id: "advanced", icon: Zap, cmsKey: "academy.categories.advanced" },
];

interface CourseCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CourseCategoryFilter = React.forwardRef<HTMLDivElement, CourseCategoryFilterProps>(
  function CourseCategoryFilter({
  activeCategory,
  onCategoryChange,
}, ref) {
  const cms = useCmsContent();

  return (
    <div ref={ref} className="mb-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
        {cms.get("academy.categories.title")}
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
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-foreground hover:bg-muted border border-border"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              <span>{cms.get(category.cmsKey)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});
