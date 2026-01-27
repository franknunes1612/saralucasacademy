import { useEffect, useState } from "react";
import appIcon from "@/assets/app-icon.png";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 1000 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 400); // Fade out duration
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-400 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(165deg, hsl(340 45% 75%) 0%, hsl(340 50% 82%) 50%, hsl(340 55% 88%) 100%)",
      }}
    >
      {/* Subtle decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: "hsl(0 0% 100%)" }}
        />
        <div 
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: "hsl(0 0% 100%)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 animate-fade-in">
        {/* App Logo */}
        <img 
          src={appIcon} 
          alt="CalorieSpot" 
          className="w-28 h-28 rounded-3xl shadow-xl mb-6 animate-[scale-up_0.6s_ease-out_forwards]"
          style={{ transform: "scale(0.8)", opacity: 0 }}
        />
        
        {/* App Name */}
        <h1 
          className="text-4xl font-bold tracking-tight mb-2"
          style={{ color: "hsl(0 0% 100%)" }}
        >
          CalorieSpot
        </h1>

        {/* Simple loading indicator - soft pulsing dot */}
        <div className="mt-10 flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              background: "hsl(0 0% 100% / 0.8)",
              animationDelay: "0ms"
            }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              background: "hsl(0 0% 100% / 0.8)",
              animationDelay: "150ms"
            }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              background: "hsl(0 0% 100% / 0.8)",
              animationDelay: "300ms"
            }}
          />
        </div>
      </div>
    </div>
  );
}
