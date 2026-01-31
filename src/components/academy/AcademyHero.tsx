import { motion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function AcademyHero() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl mb-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340_50%_78%)] via-[hsl(340_45%_72%)] to-[hsl(30_40%_75%)]" />
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full bg-[hsl(30_50%_70%)]/20 blur-xl" />
      
      {/* Content */}
      <div className="relative px-6 py-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Academy
              </h1>
              <Sparkles className="h-5 w-5 text-[hsl(30_60%_75%)]" />
            </div>
            
            <p className="text-sm text-white/80 leading-relaxed max-w-xs">
              {t({
                pt: "Cursos, programas e aulas gravadas para transformar a sua saúde",
                en: "Courses, programs and recorded classes to transform your health",
              })}
            </p>
          </div>
        </div>
        
        {/* Bronze accent line */}
        <div className="mt-6 h-0.5 bg-gradient-to-r from-[hsl(30_50%_65%)]/60 via-[hsl(30_60%_75%)]/40 to-transparent rounded-full" />
      </div>
    </motion.div>
  );
}
