import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera,
  GraduationCap,
  MessageCircle,
  Dumbbell,
  UtensilsCrossed,
  HeartHandshake,
  Sparkles,
  BookOpen,
  Play,
  ShoppingBag,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useOnboardingSlides } from "@/hooks/useOnboardingSlides";

interface OnboardingProps {
  onComplete: () => void;
}

// Icon mapping for CMS-driven icons
const ICON_MAP: Record<string, LucideIcon> = {
  "camera": Camera,
  "graduation-cap": GraduationCap,
  "message-circle": MessageCircle,
  "dumbbell": Dumbbell,
  "utensils": UtensilsCrossed,
  "heart-handshake": HeartHandshake,
  "sparkles": Sparkles,
  "book-open": BookOpen,
  "play": Play,
  "shopping-bag": ShoppingBag,
};

// Slide illustration based on icon
function SlideIllustration({ iconName, index }: { iconName: string; index: number }) {
  const IconComponent = ICON_MAP[iconName] || Sparkles;
  
  // Color variations for visual interest
  const colors = [
    "from-white/25 to-white/10",
    "from-[hsl(30_50%_75%)]/30 to-white/10",
    "from-white/20 to-[hsl(340_50%_80%)]/20",
    "from-[hsl(30_45%_70%)]/25 to-white/15",
    "from-white/25 to-[hsl(30_50%_75%)]/20",
    "from-[hsl(340_45%_75%)]/25 to-white/15",
  ];

  return (
    <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
      {/* Main icon circle */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "relative w-28 h-28 rounded-full border-2 border-white/30 shadow-xl flex items-center justify-center",
          `bg-gradient-to-br ${colors[index % colors.length]}`
        )}
      >
        <IconComponent className="h-12 w-12 text-white drop-shadow-lg" />
      </motion.div>
      
      {/* Decorative elements */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="absolute top-2 right-4 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="absolute bottom-6 left-2 w-6 h-6 rounded-full bg-white/10"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute top-6 left-8"
      >
        <Sparkles className="h-5 w-5 text-white/50 animate-pulse" />
      </motion.div>
      
      {/* Glow ring */}
      <div 
        className="absolute inset-0 w-28 h-28 m-auto rounded-full border border-white/10"
        style={{ animation: "ping 3s ease-in-out infinite" }}
      />
    </div>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { language } = useLanguage();
  const cms = useCmsContent();
  const { slides, isLoading } = useOnboardingSlides();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get CMS settings
  const autoPlay = cms.isFeatureEnabled("app.onboarding.autoPlay");
  const slideDurationStr = cms.get("app.onboarding.slideDuration", { pt: "3000", en: "3000" });
  const slideDuration = parseInt(slideDurationStr, 10) || 3000;

  // Current slide data
  const currentSlideData = slides[currentSlide];
  const totalSlides = slides.length;
  const isLast = currentSlide === totalSlides - 1;

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay || isLoading || totalSlides === 0) return;

    const timer = setTimeout(() => {
      if (isLast) {
        onComplete();
      } else {
        setCurrentSlide(prev => prev + 1);
      }
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [currentSlide, isLast, autoPlay, slideDuration, onComplete, isLoading, totalSlides]);

  // Manual skip
  const handleSkip = () => {
    onComplete();
  };

  // Manual navigation (still available for accessibility)
  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const skipLabel = language === "pt" ? "Saltar" : "Skip";

  // Show loading state briefly
  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: `linear-gradient(
            165deg,
            hsl(340 50% 78%) 0%,
            hsl(340 45% 72%) 40%,
            hsl(30 40% 75%) 100%
          )`,
        }}
      />
    );
  }

  // If no slides, skip onboarding
  if (totalSlides === 0) {
    onComplete();
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(
          165deg,
          hsl(340 50% 78%) 0%,
          hsl(340 45% 72%) 40%,
          hsl(30 40% 75%) 100%
        )`,
      }}
    >
      {/* Subtle texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Skip button */}
      <div className="flex justify-end p-4 safe-top relative z-10">
        <button
          onClick={handleSkip}
          className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
        >
          {skipLabel}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center"
          >
            {/* Illustration */}
            <div className="mb-10">
              <SlideIllustration 
                iconName={currentSlideData?.icon || "sparkles"} 
                index={currentSlide} 
              />
            </div>

            {/* Text content */}
            <div className="text-center max-w-xs">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl font-bold text-white mb-4 tracking-tight drop-shadow-sm"
              >
                {currentSlideData?.title || ""}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-white/80 text-base leading-relaxed"
              >
                {currentSlideData?.text || ""}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="px-6 pb-10 safe-bottom relative z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                index === currentSlide
                  ? "bg-white w-8"
                  : index < currentSlide
                    ? "bg-white/60 w-2"
                    : "bg-white/30 w-2"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress bar (shows time remaining on current slide) */}
        {autoPlay && (
          <div className="w-full max-w-xs mx-auto h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              key={currentSlide}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: slideDuration / 1000, ease: "linear" }}
              className="h-full bg-white/60 rounded-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
