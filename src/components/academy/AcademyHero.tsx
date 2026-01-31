import { motion } from "framer-motion";
import { ChevronRight, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";

export function AcademyHero() {
  const cms = useCmsContent();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl mb-6"
    >
      {/* Layered background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340_50%_78%)] via-[hsl(340_45%_72%)] to-[hsl(30_40%_75%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-6 right-6 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-8 left-4 w-20 h-20 rounded-full bg-[hsl(30_50%_70%)]/20 blur-2xl" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/5 blur-xl" />
      
      {/* Content */}
      <div className="relative px-6 py-8 md:py-10">
        {/* Authority badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-4"
        >
          <Award className="h-4 w-4 text-white" />
          <span className="text-xs font-medium text-white tracking-wide">
            {t({ pt: "Nutricionista Certificada", en: "Certified Nutritionist" })}
          </span>
        </motion.div>
        
        {/* Main headline - outcome focused */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-3"
        >
          {cms.get("academy.hero.headline")}
        </motion.h1>
        
        {/* Supporting subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-sm md:text-base text-white/85 leading-relaxed max-w-sm mb-6"
        >
          {cms.get("academy.hero.subheadline")}
        </motion.p>
        
        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          {/* Primary CTA */}
          <button
            onClick={() => navigate("/learn?type=course")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold text-sm shadow-lg shadow-black/10 hover:bg-white/95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t({ pt: "Explorar Cursos", en: "Explore Courses" })}
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Secondary CTA */}
          <button
            onClick={() => navigate("/learn?type=program")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm text-white font-medium text-sm border border-white/20 hover:bg-white/25 transition-all duration-200"
          >
            {t({ pt: "Ver Programas", en: "View Programs" })}
          </button>
        </motion.div>
        
        {/* Bronze accent line */}
        <div className="mt-8 h-0.5 bg-gradient-to-r from-[hsl(30_50%_65%)]/60 via-[hsl(30_60%_75%)]/40 to-transparent rounded-full" />
      </div>
    </motion.div>
  );
}