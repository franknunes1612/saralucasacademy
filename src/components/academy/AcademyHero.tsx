import React from "react";
import { motion, Variants, Easing } from "framer-motion";
import { ChevronRight, Award, Dumbbell, Utensils, BookOpen, GraduationCap, Heart, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";

// Icon map for dynamic feature tags
const TAG_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  utensils: Utensils,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  heart: Heart,
  sparkles: Sparkles,
  target: Target,
};

// Easing curve for smooth animations
const easeOut: Easing = [0.25, 0.1, 0.25, 1];

export const AcademyHero = React.forwardRef<HTMLDivElement>(
  function AcademyHero(_props, ref) {
  const cms = useCmsContent();
  const navigate = useNavigate();

  // Get CMS values
  const headline = cms.get("academy.hero.headline");
  const subheadline = cms.get("academy.hero.subheadline");
  const badgeLabel = cms.get("academy.hero.badge.label");
  const primaryCtaLabel = cms.get("academy.hero.cta.primary.label");
  const primaryCtaLink = cms.get("academy.hero.cta.primary.link");
  const secondaryCtaLabel = cms.get("academy.hero.cta.secondary.label");
  const secondaryCtaLink = cms.get("academy.hero.cta.secondary.link");
  const tertiaryCtaLabel = cms.get("academy.hero.cta.tertiary.label");
  const tertiaryCtaLink = cms.get("academy.hero.cta.tertiary.link");
  const tertiaryCtaEnabled = cms.get("academy.hero.cta.tertiary.enabled") === "true";
  const animationsEnabled = cms.isFeatureEnabled("academy.hero.animations.enabled");
  
  // Feature tags - Training, Nutrition, Education
  const tagsEnabled = cms.get("academy.hero.tags.enabled") === "true";
  const tags = [1, 2, 3].map(i => ({
    icon: cms.get(`academy.hero.tag${i}.icon`),
    label: cms.get(`academy.hero.tag${i}.label`),
  }));

  // Animation variants
  const containerVariants: Variants = animationsEnabled ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  } : { hidden: {}, visible: {} };

  const itemVariants: Variants = animationsEnabled ? {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: easeOut }
    }
  } : { hidden: {}, visible: {} };

  const badgeVariants: Variants = animationsEnabled ? {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: easeOut }
    }
  } : { hidden: {}, visible: {} };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative overflow-hidden rounded-3xl mb-6"
    >
      {/* Premium layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340_50%_78%)] via-[hsl(340_45%_72%)] to-[hsl(30_40%_75%)]" />
      
      {/* Secondary gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(340_35%_65%)]/40 via-transparent to-[hsl(30_50%_85%)]/20" />
      
      {/* Subtle bronze/beige accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[hsl(30_45%_70%)]/10 to-[hsl(30_50%_75%)]/20" />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Decorative blur elements for premium depth */}
      {animationsEnabled ? (
        <>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute top-4 right-4 w-40 h-40 rounded-full bg-white/8 blur-3xl" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 left-0 w-32 h-32 rounded-full bg-[hsl(30_50%_70%)]/15 blur-3xl" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5 blur-2xl" 
          />
        </>
      ) : (
        <>
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute bottom-12 left-0 w-32 h-32 rounded-full bg-[hsl(30_50%_70%)]/15 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
        </>
      )}
      
      {/* Content */}
      <div className="relative px-5 py-8 md:py-10">
        {/* Authority badge */}
        <motion.div
          variants={badgeVariants}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-4 shadow-sm"
        >
          <Award className="h-4 w-4 text-white drop-shadow-sm" />
          <span className="text-xs font-medium text-white tracking-wide drop-shadow-sm">
            {badgeLabel}
          </span>
        </motion.div>
        
        {/* Feature Tags - Training, Nutrition, Education */}
        {tagsEnabled && (
          <motion.div 
            variants={itemVariants} 
            className="flex flex-wrap gap-2 mb-5"
          >
            {tags.map((tag, index) => {
              const IconComponent = TAG_ICON_MAP[tag.icon] || BookOpen;
              return (
                <motion.span
                  key={index}
                  initial={animationsEnabled ? { opacity: 0, scale: 0.9 } : {}}
                  animate={animationsEnabled ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs text-white/95 font-medium shadow-sm"
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  {tag.label}
                </motion.span>
              );
            })}
          </motion.div>
        )}
        
        {/* Main headline - balanced academy focus */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-4 drop-shadow-sm max-w-sm"
        >
          {headline}
        </motion.h1>
        
        {/* Supporting subheadline - mentions training + nutrition + education */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-white/90 leading-relaxed max-w-md mb-7 drop-shadow-sm"
        >
          {subheadline}
        </motion.p>
        
        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Primary CTA */}
          <button
            onClick={() => navigate(primaryCtaLink)}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold text-sm shadow-lg shadow-black/10 hover:bg-white/95 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {primaryCtaLabel}
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          {/* Secondary CTA */}
          <button
            onClick={() => navigate(secondaryCtaLink)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm text-white font-medium text-sm border border-white/25 hover:bg-white/25 hover:border-white/35 transition-all duration-200"
          >
            {secondaryCtaLabel}
          </button>
          
          {/* Tertiary CTA - Full Academy */}
          {tertiaryCtaEnabled && (
            <button
              onClick={() => navigate(tertiaryCtaLink)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-white/80 font-medium text-sm hover:text-white transition-colors"
            >
              {tertiaryCtaLabel}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </motion.div>
        
        {/* Bronze accent line */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 h-0.5 bg-gradient-to-r from-[hsl(30_50%_65%)]/50 via-[hsl(30_60%_75%)]/30 to-transparent rounded-full" 
        />
      </div>
    </motion.div>
  );
});
