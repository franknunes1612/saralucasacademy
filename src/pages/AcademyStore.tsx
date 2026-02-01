import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, BookOpen, Dumbbell, Apple, Package, Lock, ExternalLink, Heart } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useStoreItems, type StoreItem } from "@/hooks/useStoreItems";
import { usePremiumOffers, type PremiumOffer } from "@/hooks/usePremiumOffers";
import { useRecommendedProducts, type RecommendedProduct } from "@/hooks/useRecommendedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TabType = "plans" | "products" | "favorites";

const TABS: { type: TabType; iconKey: string; labelPt: string; labelEn: string }[] = [
  { type: "plans", iconKey: "dumbbell", labelPt: "Planos", labelEn: "Plans" },
  { type: "products", iconKey: "package", labelPt: "Produtos", labelEn: "Products" },
  { type: "favorites", iconKey: "heart", labelPt: "Favoritos", labelEn: "Favorites" },
];

const ICON_MAP: Record<string, typeof ShoppingBag> = {
  dumbbell: Dumbbell,
  package: Package,
  heart: Heart,
  apple: Apple,
  bookopen: BookOpen,
};

// Premium Offer Card (Nutritional Plans, Training Plans, etc.)
function PremiumOfferCard({ offer, language }: { offer: PremiumOffer; language: "pt" | "en" }) {
  const title = language === "pt" ? offer.title_pt : offer.title_en;
  const subtitle = language === "pt" ? offer.subtitle_pt : offer.subtitle_en;
  const badge = language === "pt" ? offer.badge_pt : offer.badge_en;
  const features = language === "pt" ? offer.features_pt : offer.features_en;

  const billingLabel = {
    "one-time": language === "pt" ? "pagamento único" : "one-time",
    "monthly": language === "pt" ? "/mês" : "/mo",
    "yearly": language === "pt" ? "/ano" : "/year",
  }[offer.billing_type] || "";

  const currencySymbol = offer.currency === "EUR" ? "€" : offer.currency === "USD" ? "$" : "£";
  const priceDisplay = `${currencySymbol}${Number(offer.price).toFixed(2)}${billingLabel.startsWith("/") ? billingLabel : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="result-card p-5 space-y-4"
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", offer.accent_color || "bg-primary")}>
          <Dumbbell className="h-6 w-6 text-white" />
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
      
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div>
          <span className="text-lg font-bold text-white">{priceDisplay}</span>
          {!billingLabel.startsWith("/") && billingLabel && (
            <span className="text-xs text-white/50 ml-1">({billingLabel})</span>
          )}
        </div>
        <button className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          {language === "pt" ? "Desbloquear" : "Unlock"}
        </button>
      </div>
    </motion.div>
  );
}

// Store Item Card (Digital products, ebooks, etc.)
function StoreItemCard({ item, language }: { item: StoreItem; language: "pt" | "en" }) {
  const name = language === "pt" ? item.name_pt : item.name_en;
  const description = language === "pt" ? item.description_pt : item.description_en;
  const currencySymbol = item.currency === "EUR" ? "€" : item.currency === "USD" ? "$" : "£";

  const handlePurchase = () => {
    if (item.purchase_link) {
      window.open(item.purchase_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="result-card p-4"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
          {item.image_emoji || "📦"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{name}</h3>
              {item.brand && <p className="text-xs text-white/50">{item.brand}</p>}
            </div>
          </div>
          
          {description && (
            <p className="text-xs text-white/70 line-clamp-2 mb-2">{description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {currencySymbol}{Number(item.price).toFixed(2)}
            </span>
            {item.purchase_link && (
              <button
                onClick={handlePurchase}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                {language === "pt" ? "Comprar" : "Buy"}
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Recommended Product Card (Affiliate links)
function RecommendedProductCard({ 
  item, 
  language,
  isFavorite,
  onToggleFavorite 
}: { 
  item: RecommendedProduct;
  language: "pt" | "en";
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const name = language === "pt" ? item.name_pt : item.name_en;
  const description = language === "pt" ? item.description_pt : item.description_en;

  const handleView = () => {
    if (item.external_link) {
      window.open(item.external_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="result-card p-4"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
          {item.image_emoji || "📦"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{name}</h3>
              {item.brand && <p className="text-xs text-white/50">{item.brand}</p>}
            </div>
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn("h-4 w-4", isFavorite ? "fill-destructive text-destructive" : "text-white/40")} 
              />
            </button>
          </div>
          
          {description && (
            <p className="text-xs text-white/70 line-clamp-2 mb-2">{description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
              {language === "pt" ? "Produto recomendado" : "Recommended"}
            </span>
            {item.external_link && (
              <button
                onClick={handleView}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
              >
                {language === "pt" ? "Ver" : "View"}
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="result-card p-4">
      <div className="flex gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcademyStore() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const cms = useCmsContent();
  const [activeTab, setActiveTab] = useState<TabType>("plans");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch all data sources
  const { data: premiumOffers, isLoading: offersLoading } = usePremiumOffers();
  const { data: storeItems, isLoading: storeLoading } = useStoreItems();
  const { data: recommendedProducts, isLoading: productsLoading } = useRecommendedProducts();

  const isLoading = offersLoading || storeLoading || productsLoading;

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Combine store items and recommended products for "Products" tab
  const allProducts = useMemo(() => {
    return [...(storeItems || []), ...(recommendedProducts || [])];
  }, [storeItems, recommendedProducts]);

  // Filter favorites
  const favoriteProducts = useMemo(() => {
    return (recommendedProducts || []).filter(p => favorites.has(p.id));
  }, [recommendedProducts, favorites]);

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/learn")}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t({ pt: "Loja", en: "Store" })}
          </h1>
          <p className="text-xs text-white/60">
            {t({ pt: "Recursos premium & produtos", en: "Premium resources & products" })}
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="result-card p-5 mb-6 text-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <ShoppingBag className="h-10 w-10 text-white/80 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">
          {t({ pt: "Recursos Premium", en: "Premium Resources" })}
        </h2>
        <p className="text-sm text-white/70 max-w-xs mx-auto">
          {t({ 
            pt: "Planos nutricionais, treinos e produtos recomendados para a tua jornada.",
            en: "Nutritional plans, workouts and recommended products for your journey."
          })}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = ICON_MAP[tab.iconKey] || ShoppingBag;
          const isActive = activeTab === tab.type;
          const label = language === "pt" ? tab.labelPt : tab.labelEn;
          
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-white text-[hsl(340_45%_45%)] shadow-md"
                  : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[hsl(340_45%_50%)]" : "text-white/60")} />
              {label}
              {tab.type === "favorites" && favorites.size > 0 && (
                <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  {favorites.size}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : activeTab === "plans" ? (
          // Plans Tab - Premium Offers
          premiumOffers && premiumOffers.length > 0 ? (
            premiumOffers.map((offer) => (
              <PremiumOfferCard key={offer.id} offer={offer} language={language} />
            ))
          ) : (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">
                {t({ pt: "Brevemente novos planos", en: "New plans coming soon" })}
              </p>
            </div>
          )
        ) : activeTab === "products" ? (
          // Products Tab - Store Items + Recommended Products
          allProducts.length > 0 ? (
            <>
              {/* Store Items */}
              {storeItems && storeItems.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-medium text-white/70 px-1">
                    {t({ pt: "Produtos Digitais", en: "Digital Products" })}
                  </h3>
                  {storeItems.map((item) => (
                    <StoreItemCard key={item.id} item={item} language={language} />
                  ))}
                </div>
              )}
              
              {/* Recommended Products */}
              {recommendedProducts && recommendedProducts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/70 px-1">
                    {t({ pt: "Produtos Recomendados", en: "Recommended Products" })}
                  </h3>
                  {recommendedProducts.map((item) => (
                    <RecommendedProductCard 
                      key={item.id} 
                      item={item} 
                      language={language}
                      isFavorite={favorites.has(item.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">
                {t({ pt: "Sem produtos disponíveis", en: "No products available" })}
              </p>
            </div>
          )
        ) : (
          // Favorites Tab
          favoriteProducts.length > 0 ? (
            favoriteProducts.map((item) => (
              <RecommendedProductCard 
                key={item.id} 
                item={item} 
                language={language}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">
                {t({ pt: "Sem favoritos", en: "No favorites yet" })}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {t({ pt: "Toca no coração para guardar produtos", en: "Tap the heart to save products" })}
              </p>
            </div>
          )
        )}
      </div>

      {/* Disclaimers */}
      <div className="mt-6 space-y-2">
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-[10px] text-white/40 text-center">
            {t({
              pt: "Alguns links são links de afiliados. Podemos ganhar uma pequena comissão sem custo extra para si.",
              en: "Some links are affiliate links. We may earn a small commission at no extra cost to you."
            })}
          </p>
        </div>
        <p className="text-[10px] text-white/30 text-center px-4">
          {t({
            pt: "Todas as compras não são reembolsáveis. Os planos personalizados são gerados por IA e autoguiados.",
            en: "All purchases are non-refundable. Personalized plans are AI-generated and self-guided."
          })}
        </p>
      </div>
    </div>
  );
}
