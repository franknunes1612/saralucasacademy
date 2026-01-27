import { useEffect, useState } from "react";
import splashHero from "@/assets/splash-hero-optimized.jpg";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 1200 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 300);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background hero image with subtle zoom animation */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={splashHero}
          alt=""
          className="w-full h-full object-cover animate-splash-zoom opacity-60"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Logo / App Name */}
        <h1 className="text-5xl font-bold mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-[hsl(45,100%,50%)] bg-clip-text text-transparent">
            CalorieSpot
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-muted-foreground text-sm mb-10 animate-fade-in">
          Scan your food, know your calories
        </p>

        {/* Loading ring */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"
              style={{ animationDuration: "1s" }}
            />
          </div>
          {/* Glow pulse */}
          <div className="absolute inset-0 rounded-full animate-glow-pulse opacity-50" />
        </div>

        {/* Loading text */}
        <p className="text-xs text-muted-foreground mt-5 animate-pulse">
          Initializing…
        </p>
      </div>
    </div>
  );
}
