import { useEffect, useState } from "react";
import splashImage from "@/assets/splash-screen.png";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 3000 }: SplashScreenProps) {
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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Full-screen splash image - no overlays, loaders, or buttons */}
      <img
        src={splashImage}
        alt="CalorieSpot by Sara Lucas"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          // Ensure proper scaling for all devices
          minWidth: "100%",
          minHeight: "100%",
        }}
      />
    </div>
  );
}
