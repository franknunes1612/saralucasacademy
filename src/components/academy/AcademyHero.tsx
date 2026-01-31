import { motion, AnimatePresence, Variants, Easing } from "framer-motion";
import { ChevronRight, Award, Play, BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";
import { useFeaturedAcademyItems } from "@/hooks/useAcademyItems";

// Hero anchor component - Featured Course Card
function FeaturedCourseAnchor() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: featuredItems, isLoading } = useFeaturedAcademyItems();
  
  const featured = featuredItems?.find(item => 
    item.item_type === "course" || item.item_type === "program"
  );

  if (isLoading) {
    return (
      <div className="w-full h-32 rounded-2xl bg-white/10 animate-pulse" />
    );
  }

  if (!featured) return null;

  const title = language === "pt" ? featured.title_pt : featured.title_en;
  const subtitle = language === "pt" ? featured.subtitle_pt : featured.subtitle_en;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => navigate(`/learn/course/${featured.id}`)}
      className="w-full group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl shadow-black/10 border border-white/50 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02] group-active:scale-[0.98]">
        <div className="flex items-stretch">
          {/* Thumbnail */}
          <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden">
            {featured.cover_image_url ? (
              <img 
                src={featured.cover_image_url} 
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[hsl(340_50%_75%)] to-[hsl(30_45%_70%)] flex items-center justify-center">
                <span className="text-3xl">{featured.cover_emoji || "📚"}</span>
              </div>
            )}
            {/* Play overlay for courses */}
            {featured.item_type === "course" && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="h-4 w-4 text-[hsl(340_45%_45%)] ml-0.5" fill="currentColor" />
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
            {featured.badge_pt && (
              <span className="inline-flex items-center self-start px-2 py-0.5 rounded-full bg-[hsl(340_50%_90%)] text-[hsl(340_45%_40%)] text-[10px] font-semibold uppercase tracking-wide mb-1">
                {language === "pt" ? featured.badge_pt : featured.badge_en}
              </span>
            )}
            <h4 className="font-bold text-[hsl(340_30%_25%)] text-sm leading-snug line-clamp-2 mb-1">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[10px] text-[hsl(340_20%_40%)] line-clamp-1 mb-2">
                {subtitle}
              </p>
            )}
            <div className="flex items-center gap-3 text-[10px] text-[hsl(340_20%_50%)]">
              {featured.total_lessons && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {featured.total_lessons} aulas
                </span>
              )}
              {featured.total_duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.round(featured.total_duration_minutes / 60)}h
                </span>
              )}
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center pr-3">
            <ChevronRight className="h-5 w-5 text-[hsl(340_30%_60%)] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// Hero anchor component - Video
function VideoAnchor({ videoUrl }: { videoUrl: string }) {
  if (!videoUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full aspect-video max-h-48 rounded-2xl overflow-hidden shadow-xl shadow-black/15 border border-white/20"
    >
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </motion.div>
  );
}

// Hero anchor component - Image
function ImageAnchor({ imageUrl }: { imageUrl: string }) {
  if (!imageUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full aspect-[16/9] max-h-48 rounded-2xl overflow-hidden shadow-xl shadow-black/15 border border-white/20"
    >
      <img 
        src={imageUrl} 
        alt="Academy" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}

// Easing curve for smooth animations
const easeOut: Easing = [0.25, 0.1, 0.25, 1];

export function AcademyHero() {
  const cms = useCmsContent();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Get CMS values
  const headline = cms.get("academy.hero.headline");
  const subheadline = cms.get("academy.hero.subheadline");
  const badgeLabel = cms.get("academy.hero.badge.label");
  const primaryCtaLabel = cms.get("academy.hero.cta.primary.label");
  const primaryCtaLink = cms.get("academy.hero.cta.primary.link");
  const secondaryCtaLabel = cms.get("academy.hero.cta.secondary.label");
  const secondaryCtaLink = cms.get("academy.hero.cta.secondary.link");
  const layout = cms.get("academy.hero.layout");
  const videoUrl = cms.get("academy.hero.video.url");
  const imageUrl = cms.get("academy.hero.image.url");
  const animationsEnabled = cms.isFeatureEnabled("academy.hero.animations.enabled");

  // Animation variants - properly typed
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative overflow-hidden rounded-3xl mb-6"
    >
      {/* Layered gradient background for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340_50%_78%)] via-[hsl(340_45%_72%)] to-[hsl(30_40%_75%)]" />
      
      {/* Secondary gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(340_35%_65%)]/40 via-transparent to-[hsl(30_50%_85%)]/20" />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Decorative blur elements */}
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
            className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-white/5 blur-2xl" 
          />
        </>
      ) : (
        <>
          <div className="absolute top-4 right-4 w-40 h-40 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute bottom-12 left-0 w-32 h-32 rounded-full bg-[hsl(30_50%_70%)]/15 blur-3xl" />
          <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
        </>
      )}
      
      {/* Content */}
      <div className="relative px-5 py-7 md:py-9">
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
        
        {/* Main headline - outcome focused */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-3 drop-shadow-sm"
        >
          {headline}
        </motion.h1>
        
        {/* Supporting subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-white/90 leading-relaxed max-w-md mb-6 drop-shadow-sm"
        >
          {subheadline}
        </motion.p>
        
        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-3 mb-6"
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
        </motion.div>

        {/* Visual Anchor Element */}
        <AnimatePresence mode="wait">
          {layout === "video" && videoUrl ? (
            <VideoAnchor key="video" videoUrl={videoUrl} />
          ) : layout === "image" && imageUrl ? (
            <ImageAnchor key="image" imageUrl={imageUrl} />
          ) : (
            <FeaturedCourseAnchor key="featured" />
          )}
        </AnimatePresence>
        
        {/* Bronze accent line */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 h-0.5 bg-gradient-to-r from-[hsl(30_50%_65%)]/50 via-[hsl(30_60%_75%)]/30 to-transparent rounded-full" 
        />
      </div>
    </motion.div>
  );
}
