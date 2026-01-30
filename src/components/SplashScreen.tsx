import { useEffect, useState } from "react";
import splashImage from "@/assets/splash-screen.png";
import { SaraLucasLogo } from "@/components/brand/SaraLucasLogo";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 5000 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    requestAnimationFrame(() => {
      setIsEntered(true);
    });

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 400); // Fade out duration
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Full-screen splash image with entrance animation */}
      <img
        src={splashImage}
        alt="Sara Lucas - Nutrition & Training Academy"
        className="absolute inset-0 w-full h-full object-cover object-center transition-all ease-out"
        style={{
          minWidth: "100%",
          minHeight: "100%",
          transitionDuration: "600ms",
          transform: isEntered ? "scale(1)" : "scale(1.05)",
          opacity: isEntered ? 1 : 0,
        }}
      />
      
      {/* Signature logo overlay - centered */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 transition-all ease-out"
        style={{
          transitionDuration: "800ms",
          transitionDelay: "200ms",
          opacity: isEntered ? 1 : 0,
          transform: isEntered ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        }}
      >
        <SaraLucasLogo size="xl" className="drop-shadow-2xl" />
      </div>
    </div>
  );
}
