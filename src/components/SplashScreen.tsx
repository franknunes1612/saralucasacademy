import { useEffect, useState } from "react";
import { useCmsContent } from "@/hooks/useCmsContent";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const cms = useCmsContent();

  const title = cms.get("app.splash.title", { pt: "Sara Lucas", en: "Sara Lucas" });
  const subtitle = cms.get("app.splash.subtitle", { pt: "Nutrição & Treino Personalizado", en: "Personalized Nutrition & Training" });
  const durationStr = cms.get("app.splash.duration", { pt: "2000", en: "2000" });
  const duration = parseInt(durationStr, 10) || 2000;

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsEntered(true), 100);
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, duration);
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer); };
  }, [onComplete, duration]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${isExiting ? "opacity-0" : "opacity-100"}`}
      style={{ background: "linear-gradient(165deg, hsl(30 30% 95%) 0%, hsl(30 55% 98%) 40%, hsl(20 52% 53% / 0.1) 100%)" }}
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, hsl(20 52% 53% / 0.08) 0%, transparent 70%)" }} />

      {/* Logo */}
      <div
        className="relative z-10 flex flex-col items-center transition-all ease-out"
        style={{ transitionDuration: "800ms", opacity: isEntered ? 1 : 0, transform: isEntered ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)" }}
      >
        <h1 className="font-serif text-5xl sm:text-6xl text-espresso font-semibold tracking-wide select-none">
          {title.replace("Sara Lucas", "Sara").split("Sara")[0]}Sara<span className="text-primary">.</span>Lucas
        </h1>
        <p
          className="mt-3 text-sm sm:text-base text-text-light font-light tracking-widest uppercase transition-all ease-out"
          style={{ transitionDuration: "800ms", transitionDelay: "200ms", opacity: isEntered ? 1 : 0, transform: isEntered ? "translateY(0)" : "translateY(10px)" }}
        >
          {subtitle}
        </p>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to top, hsl(30 30% 86% / 0.3) 0%, transparent 100%)" }} />
    </div>
  );
}
