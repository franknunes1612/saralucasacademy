import { cn } from "@/lib/utils";

interface SaraLucasLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "blush";
}

/**
 * Sara Lucas signature-style text logo
 * Handwritten, elegant, feminine aesthetic
 */
export function SaraLucasLogo({ 
  className, 
  size = "md",
  variant = "light"
}: SaraLucasLogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const colorClasses = {
    light: "text-white",
    blush: "text-[hsl(340,55%,90%)]", // Soft blush that works on pink
  };

  return (
    <span
      className={cn(
        "font-signature font-medium tracking-wide select-none",
        sizeClasses[size],
        colorClasses[variant],
        className
      )}
      style={{
        textShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      Sara Lucas
    </span>
  );
}

/**
 * Full brand mark with optional tagline
 */
export function SaraLucasBrand({
  className,
  showTagline = false,
  tagline,
  size = "md",
}: {
  className?: string;
  showTagline?: boolean;
  tagline?: { pt: string; en: string };
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <SaraLucasLogo size={size} />
      {showTagline && tagline && (
        <span className="text-xs text-white/60 tracking-wide mt-0.5">
          {tagline.en}
        </span>
      )}
    </div>
  );
}
