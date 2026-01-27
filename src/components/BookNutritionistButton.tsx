import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface BookNutritionistButtonProps {
  variant?: "primary" | "secondary" | "subtle";
  className?: string;
  fullWidth?: boolean;
}

const WHATSAPP_NUMBER = "351939535077";

const MESSAGES = {
  pt: "Olá! Sou cliente do CalorieSpot e tenho interesse em agendar uma consulta de nutrição.",
  en: "Hi! I'm a CalorieSpot user and I'd like to book a nutrition consultation.",
};

const LABELS = {
  pt: "Agendar Nutricionista",
  en: "Book a Nutritionist",
};

export function BookNutritionistButton({
  variant = "secondary",
  className,
  fullWidth = false,
}: BookNutritionistButtonProps) {
  const { language, t } = useLanguage();

  const handleClick = () => {
    const message = encodeURIComponent(MESSAGES[language]);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    // Open WhatsApp (works on mobile app or web fallback)
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const label = t(LABELS);

  const baseClasses = "flex items-center justify-center gap-2 font-medium rounded-xl transition-all";
  
  const variantClasses = {
    primary: "py-4 px-6 btn-primary",
    secondary: "py-3 px-5 btn-secondary",
    subtle: "py-2.5 px-4 bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 text-sm",
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
