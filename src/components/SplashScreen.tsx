import { useEffect, useState } from "react";
import splashImage from "@/assets/splash-screen.png";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 3000 }: SplashScreenProps) {
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
        alt="CalorieSpot by Sara Lucas"
        className="absolute inset-0 w-full h-full object-cover object-center transition-all ease-out"
        style={{
          minWidth: "100%",
          minHeight: "100%",
          transitionDuration: "600ms",
          transform: isEntered ? "scale(1)" : "scale(1.05)",
          opacity: isEntered ? 1 : 0,
        }}
      />
    </div>
  );
}
