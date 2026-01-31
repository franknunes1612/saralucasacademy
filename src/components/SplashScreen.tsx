import { useEffect, useState } from "react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";
import saraSplashPortrait from "@/assets/sara-splash-portrait-nobg.png";

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Premium splash screen with gradient background, signature logo, and portrait
 * All content and duration controlled via CMS
 */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const cms = useCmsContent();
  const { language } = useLanguage();

  // Get CMS values
  const title = cms.get("app.splash.title", { pt: "Sara Lucas", en: "Sara Lucas" });
  const subtitle = cms.get("app.splash.subtitle", { 
    pt: "Nutrição & Training Academy", 
    en: "Nutrition & Training Academy" 
  });
  const durationStr = cms.get("app.splash.duration", { pt: "2500", en: "2500" });
  const duration = parseInt(durationStr, 10) || 2500;

  useEffect(() => {
    // Trigger entrance animation after mount
    const enterTimer = setTimeout(() => {
      setIsEntered(true);
    }, 100);

    // Start exit after duration
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500); // Fade out duration
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete, duration]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 overflow-hidden ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: `linear-gradient(
          165deg,
          hsl(340 50% 78%) 0%,
          hsl(340 45% 72%) 40%,
          hsl(30 40% 75%) 100%
        )`,
      }}
    >
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            ellipse 80% 60% at 50% 45%,
            hsl(340 55% 85% / 0.4) 0%,
            transparent 70%
          )`,
        }}
      />

      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Logo container - centered like before */}
      <div
        className="relative z-20 flex flex-col items-center transition-all ease-out"
        style={{
          transitionDuration: "800ms",
          opacity: isEntered ? 1 : 0,
          transform: isEntered ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        }}
      >
        {/* Signature logo - handwritten style */}
        <h1
          className="font-signature text-5xl sm:text-6xl text-white font-medium tracking-wide select-none"
          style={{
            textShadow: "0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className="mt-3 text-sm sm:text-base text-white/70 font-light tracking-widest uppercase transition-all ease-out"
          style={{
            transitionDuration: "800ms",
            transitionDelay: "200ms",
            opacity: isEntered ? 1 : 0,
            transform: isEntered ? "translateY(0)" : "translateY(10px)",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Sara portrait - positioned to the right side, going off screen at the bottom */}
      <div
        className="absolute bottom-0 right-0 z-10 transition-all ease-out"
        style={{
          transitionDuration: "1000ms",
          transitionDelay: "300ms",
          opacity: isEntered ? 1 : 0,
          transform: isEntered 
            ? "translateX(10%) translateY(12%)" 
            : "translateX(20%) translateY(25%)",
        }}
      >
        <img
          src={saraSplashPortrait}
          alt="Sara Lucas"
          className="w-auto max-w-none h-[75vh] sm:h-[80vh] object-contain object-bottom select-none pointer-events-none"
          style={{
            filter: "drop-shadow(-10px 0 40px rgba(0,0,0,0.15))",
            // Blend white edges with background using mix-blend-mode
            mixBlendMode: "multiply",
          }}
        />
      </div>

      {/* Decorative bottom gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20"
        style={{
          background: `linear-gradient(
            to top,
            hsl(340 45% 72%) 0%,
            transparent 100%
          )`,
        }}
      />
    </div>
  );
}
