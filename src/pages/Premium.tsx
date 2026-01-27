import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Dumbbell, Heart, Gift, Star, Zap, Crown } from "lucide-react";
import { usePremiumOffers, type PremiumOffer } from "@/hooks/usePremiumOffers";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  heart: Heart,
  gift: Gift,
  star: Star,
  zap: Zap,
  crown: Crown,
};

interface PremiumCardProps {
  offer: PremiumOffer;
  language: "pt" | "en";
  onSelect: (offer: PremiumOffer) => void;
}

function PremiumCard({ offer, language, onSelect }: PremiumCardProps) {
  const Icon = ICON_MAP[offer.icon || "sparkles"] || Sparkles;
  const title = language === "pt" ? offer.title_pt : offer.title_en;
  const subtitle = language === "pt" ? offer.subtitle_pt : offer.subtitle_en;
  const badge = language === "pt" ? offer.badge_pt : offer.badge_en;
  const features = language === "pt" ? offer.features_pt : offer.features_en;
  
  const billingLabel = {
    "one-time": language === "pt" ? "pagamento único" : "one-time",
    "monthly": language === "pt" ? "/mês" : "/mo",
    "yearly": language === "pt" ? "/ano" : "/year",
  }[offer.billing_type] || "";

  const priceDisplay = `${offer.currency === "EUR" ? "€" : offer.currency === "USD" ? "$" : "£"}${Number(offer.price).toFixed(2)}${billingLabel.startsWith("/") ? billingLabel : ""}`;

  return (
    <div className="result-card p-5 space-y-4">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${offer.accent_color || "bg-primary"}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{title}</h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-white/70 leading-relaxed">{subtitle}</p>
          )}
          {features && features.length > 0 && (
            <ul className="mt-2 space-y-1">
              {features.slice(0, 3).map((feature, i) => (
                <li key={i} className="text-xs text-white/60 flex items-center gap-1">
                  <span className="text-success">✓</span> {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <span className="text-lg font-bold text-white">{priceDisplay}</span>
        <button 
          onClick={() => onSelect(offer)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          {language === "pt" ? "Ver mais" : "Learn More"}
        </button>
      </div>
    </div>
  );
}

function PremiumCardSkeleton() {
  return (
    <div className="result-card p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export default function Premium() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: offers, isLoading, error } = usePremiumOffers();

  const handleSelect = (offer: PremiumOffer) => {
    // Navigate based on offer type/category - for now just show details
    // In future this could route to specific purchase flows
    const titleEn = (offer.title_en || "").toLowerCase();
    const titlePt = (offer.title_pt || "").toLowerCase();

    const isProducts =
      offer.icon === "heart" ||
      titleEn.includes("product") ||
      titleEn.includes("favorite") ||
      titlePt.includes("produto") ||
      titlePt.includes("favorito");

    if (isProducts) {
      navigate("/premium/products");
    } else if (titleEn.includes("training")) {
      navigate("/premium/training");
    } else if (titleEn.includes("gift")) {
      navigate("/premium/gift");
    } else {
      navigate("/premium/plans");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">
          {t({ pt: "Premium", en: "Premium Features" })}
        </h1>
      </div>

      {/* Hero section */}
      <div className="result-card p-6 mb-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {t({ pt: "Eleva a Tua Nutrição", en: "Level Up Your Nutrition" })}
        </h2>
        <p className="text-sm text-white/70 max-w-xs mx-auto">
          {t({ 
            pt: "Planos personalizados, treinos on-demand e recomendações de produtos.",
            en: "Get personalized plans, on-demand workouts, and curated product recommendations."
          })}
        </p>
      </div>

      {/* Premium offers - data driven */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <PremiumCardSkeleton />
            <PremiumCardSkeleton />
            <PremiumCardSkeleton />
          </>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-white/60">
              {t({ pt: "Erro ao carregar ofertas", en: "Error loading offers" })}
            </p>
          </div>
        ) : offers && offers.length > 0 ? (
          offers.map((offer) => (
            <PremiumCard 
              key={offer.id} 
              offer={offer} 
              language={language} 
              onSelect={handleSelect}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">
              {t({ pt: "Brevemente novas ofertas", en: "New offers coming soon" })}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-white/40 text-center mt-8 px-4">
        {t({
          pt: "Todas as compras não são reembolsáveis. Os planos personalizados são gerados por IA e autoguiados. Não substitui aconselhamento médico profissional.",
          en: "All purchases are non-refundable. Personalized plans are AI-generated and self-guided. Not a substitute for professional medical advice."
        })}
      </p>
    </div>
  );
}
