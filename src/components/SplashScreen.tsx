import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

/**
 * Premium splash screen with gradient background and signature logo
 * Shows on every app launch for brand presence
 */
export function SplashScreen({ onComplete, minDuration = 2500 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const enterTimer = setTimeout(() => {
      setIsEntered(true);
    }, 100);

    // Start exit after duration
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500); // Fade out duration
    }, minDuration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: `linear-gradient(
          165deg,
          hsl(340 50% 78%) 0%,
          hsl(340 45% 72%) 40%,
          hsl(340 40% 68%) 100%
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

      {/* Logo container with entrance animation */}
      <div
        className="relative z-10 flex flex-col items-center transition-all ease-out"
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
          Sara Lucas
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
          Nutrição & Training Academy
        </p>
      </div>

      {/* Decorative bottom gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(
            to top,
            hsl(340 40% 65% / 0.5) 0%,
            transparent 100%
          )`,
        }}
      />
    </div>
  );
}
