import { cn } from "@/lib/utils";

interface SaraLucasLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "dark" | "light" | "terracotta";
}

/**
 * Sara Lucas editorial text logo
 * Serif, elegant, warm aesthetic
 */
export function SaraLucasLogo({ 
  className, 
  size = "md",
  variant = "dark"
}: SaraLucasLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const colorClasses = {
    dark: "text-foreground",
    light: "text-cream",
    terracotta: "text-primary",
  };

  return (
    <a href="/" className={cn(
      "font-serif font-semibold tracking-wide select-none no-underline",
      sizeClasses[size],
      colorClasses[variant],
      className
    )}>
      Sara<span className="text-primary">.</span>Lucas
    </a>
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
        <span className="text-xs text-muted-foreground tracking-wide mt-0.5">
          {tagline.en}
        </span>
      )}
    </div>
  );
}
