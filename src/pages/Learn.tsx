import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, PlayCircle, Calendar, Package, Search, Sparkles, ShoppingBag, Dumbbell, Heart, ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useAcademyItems, AcademyItemType, AcademyItem } from "@/hooks/useAcademyItems";
import { useStoreItems, type StoreItem } from "@/hooks/useStoreItems";
import { usePremiumOffers, type PremiumOffer } from "@/hooks/usePremiumOffers";
import { useRecommendedProducts, type RecommendedProduct } from "@/hooks/useRecommendedProducts";
import { useCheckout } from "@/hooks/useCheckout";
import { AcademyHero } from "@/components/academy/AcademyHero";
import { CourseCard } from "@/components/academy/CourseCard";
import { CourseCategoryFilter } from "@/components/academy/CourseCategoryFilter";
import { AcademyCard } from "@/components/academy/AcademyCard";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ExtendedAcademyItem = AcademyItem & {
  instructor_name?: string;
  total_duration_minutes?: number;
  total_lessons?: number;
  difficulty_level?: string;
};

type TabType = AcademyItemType | "all" | "store";

// Store Components
function PremiumOfferCard({ 
  offer, 
  language,
  onPurchase,
  isLoading 
}: { 
  offer: PremiumOffer & { stripe_price_id?: string; enable_purchase?: boolean; button_text_pt?: string; button_text_en?: string }; 
  language: "pt" | "en";
  onPurchase: (id: string) => void;
  isLoading: boolean;
}) {
  const title = language === "pt" ? offer.title_pt : offer.title_en;
  const subtitle = language === "pt" ? offer.subtitle_pt : offer.subtitle_en;
  const badge = language === "pt" ? offer.badge_pt : offer.badge_en;
  const features = language === "pt" ? offer.features_pt : offer.features_en;
  const buttonText = language === "pt" 
    ? (offer.button_text_pt || "Comprar") 
    : (offer.button_text_en || "Buy");

  const billingLabel = {
    "one-time": language === "pt" ? "pagamento único" : "one-time",
    "monthly": language === "pt" ? "/mês" : "/mo",
    "yearly": language === "pt" ? "/ano" : "/year",
  }[offer.billing_type] || "";

  const currencySymbol = offer.currency === "EUR" ? "€" : offer.currency === "USD" ? "$" : "£";
  const priceDisplay = `${currencySymbol}${Number(offer.price).toFixed(2)}${billingLabel.startsWith("/") ? billingLabel : ""}`;

  const canPurchase = offer.enable_purchase !== false;

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
        {canPurchase && (
          <button 
            onClick={() => onPurchase(offer.id)}
            disabled={isLoading}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
            {buttonText}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function StoreItemCard({ 
  item, 
  language,
  onPurchase,
  isLoading
}: { 
  item: StoreItem & { stripe_price_id?: string; button_text_pt?: string; button_text_en?: string }; 
  language: "pt" | "en";
  onPurchase: (id: string) => void;
  isLoading: boolean;
}) {
  const name = language === "pt" ? item.name_pt : item.name_en;
  const description = language === "pt" ? item.description_pt : item.description_en;
  const currencySymbol = item.currency === "EUR" ? "€" : item.currency === "USD" ? "$" : "£";
  const buttonText = language === "pt" 
    ? (item.button_text_pt || "Comprar") 
    : (item.button_text_en || "Buy");

  // Determine if we should use Stripe or external link
  const hasStripePrice = !!item.stripe_price_id;
  const hasExternalLink = !!item.purchase_link;

  const handleClick = () => {
    if (hasStripePrice) {
      onPurchase(item.id);
    } else if (hasExternalLink) {
      window.open(item.purchase_link!, "_blank", "noopener,noreferrer");
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
          <h3 className="font-semibold text-white truncate">{name}</h3>
          {item.brand && <p className="text-xs text-white/50">{item.brand}</p>}
          {description && (
            <p className="text-xs text-white/70 line-clamp-2 my-1">{description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-white">
              {currencySymbol}{Number(item.price).toFixed(2)}
            </span>
            {(hasStripePrice || hasExternalLink) && (
              <button
                onClick={handleClick}
                disabled={isLoading && hasStripePrice}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading && hasStripePrice ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : hasStripePrice ? (
                  <ShoppingCart className="h-3 w-3" />
                ) : (
                  <ExternalLink className="h-3 w-3" />
                )}
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{name}</h3>
              {item.brand && <p className="text-xs text-white/50">{item.brand}</p>}
            </div>
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-destructive text-destructive" : "text-white/40")} />
            </button>
          </div>
          {description && (
            <p className="text-xs text-white/70 line-clamp-2 my-1">{description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
              {language === "pt" ? "Recomendado" : "Recommended"}
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

export default function Learn() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const cms = useCmsContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);

  const activeType = (searchParams.get("type") as TabType) || "all";
  const isStoreTab = activeType === "store";
  
  const { data: items, isLoading, error } = useAcademyItems(
    activeType === "all" || activeType === "store" ? undefined : activeType
  );

  // Store data
  const { data: premiumOffers, isLoading: offersLoading } = usePremiumOffers();
  const { data: storeItems, isLoading: storeLoading } = useStoreItems();
  const { data: recommendedProducts, isLoading: productsLoading } = useRecommendedProducts();

  // Checkout hook
  const { checkout, isLoading: isCheckingOut } = useCheckout({
    onSuccess: () => setCheckoutProductId(null),
    onError: () => setCheckoutProductId(null),
  });

  const handlePremiumPurchase = (offerId: string) => {
    setCheckoutProductId(offerId);
    checkout(offerId, "premium_offer", true);
  };

  const handleStorePurchase = (itemId: string) => {
    setCheckoutProductId(itemId);
    checkout(itemId, "store_item", true);
  };

  // Type filters with CMS labels - now includes Store
  const TYPE_FILTERS = useMemo(() => [
    { type: "all" as const, icon: Sparkles, labelKey: "academy.filter.all" },
    { type: "course" as const, icon: PlayCircle, labelKey: "academy.filter.courses" },
    { type: "ebook" as const, icon: BookOpen, labelKey: "academy.filter.ebooks" },
    { type: "program" as const, icon: Calendar, labelKey: "academy.filter.programs" },
    { type: "bundle" as const, icon: Package, labelKey: "academy.filter.bundles" },
    { type: "store" as const, icon: ShoppingBag, labelKey: "academy.filter.store" },
  ], []);

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

  // Filter items
  const filteredItems = useMemo(() => {
    if (!items || isStoreTab) return [];
    
    let filtered = items as ExtendedAcademyItem[];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const title = language === "pt" ? item.title_pt : item.title_en;
        const subtitle = language === "pt" ? item.subtitle_pt : item.subtitle_en;
        const description = language === "pt" ? item.description_pt : item.description_en;

        return (
          title.toLowerCase().includes(query) ||
          subtitle?.toLowerCase().includes(query) ||
          description?.toLowerCase().includes(query)
        );
      });
    }

    // Category filter (for courses)
    if (categoryFilter !== "all" && activeType === "course") {
      filtered = filtered.filter((item) => {
        if (categoryFilter === "beginner") {
          return item.difficulty_level === "beginner";
        }
        if (categoryFilter === "advanced") {
          return item.difficulty_level === "advanced" || item.difficulty_level === "intermediate";
        }
        return item.category === categoryFilter;
      });
    }

    return filtered;
  }, [items, searchQuery, language, categoryFilter, activeType, isStoreTab]);

  // Separate featured items (courses or programs)
  const featuredItems = useMemo(() => {
    if (isStoreTab) return [];
    if (activeType !== "all" && activeType !== "course" && activeType !== "program") return [];
    return filteredItems.filter((item) => 
      item.is_featured && (item.item_type === "course" || item.item_type === "program")
    ).slice(0, 1);
  }, [filteredItems, activeType, isStoreTab]);

  const regularItems = useMemo(() => {
    const featuredIds = new Set(featuredItems.map((c) => c.id));
    return filteredItems.filter((item) => !featuredIds.has(item.id));
  }, [filteredItems, featuredItems]);

  const handleTypeChange = (type: TabType) => {
    if (type === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ type });
    }
    setCategoryFilter("all");
  };

  const showCourseUI = !isStoreTab && (activeType === "all" || activeType === "course" || activeType === "program");

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {cms.get("academy.hero.title")}
          </h1>
          <p className="text-xs text-white/60">
            {cms.get("academy.hero.subtitle")}
          </p>
        </div>
      </div>

      {/* Hero Section (only on main view) */}
      {activeType === "all" && !searchQuery && (
        <>
          <AcademyHero />
          {/* Testimonials Section - below hero */}
          <TestimonialsSection location="academy" className="mb-4" />
        </>
      )}

      {/* Search (not for store) */}
      {!isStoreTab && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder={cms.get("academy.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
          />
        </div>
      )}

      {/* Type Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.type}
            onClick={() => handleTypeChange(filter.type)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeType === filter.type
                ? "bg-white text-[hsl(340_45%_45%)] shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/5"
            )}
          >
            <filter.icon className={cn(
              "h-4 w-4",
              activeType === filter.type ? "text-[hsl(340_45%_50%)]" : "text-white/60"
            )} />
            {filter.type === "store" 
              ? (language === "pt" ? "Loja" : "Store")
              : cms.get(filter.labelKey)
            }
          </button>
        ))}
      </div>

      {/* Category Filter (for courses) */}
      {showCourseUI && !searchQuery && (
        <CourseCategoryFilter
          activeCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
      )}

      {/* Content */}
      {isStoreTab ? (
        // Store Tab Content
        <div className="space-y-4">
          {/* Store Hero */}
          <div className="result-card p-5 text-center bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
            <ShoppingBag className="h-8 w-8 text-white/80 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-white mb-1">
              {language === "pt" ? "Recursos Premium" : "Premium Resources"}
            </h2>
            <p className="text-sm text-white/70">
              {language === "pt" 
                ? "Planos, produtos e recomendações para a tua jornada." 
                : "Plans, products and recommendations for your journey."}
            </p>
          </div>

          {offersLoading || storeLoading || productsLoading ? (
            <>
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </>
          ) : (
            <>
              {/* Premium Offers / Plans */}
              {premiumOffers && premiumOffers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/70 px-1">
                    {language === "pt" ? "Planos & Serviços" : "Plans & Services"}
                  </h3>
                  {premiumOffers.map((offer) => (
                    <PremiumOfferCard 
                      key={offer.id} 
                      offer={offer} 
                      language={language}
                      onPurchase={handlePremiumPurchase}
                      isLoading={isCheckingOut && checkoutProductId === offer.id}
                    />
                  ))}
                </div>
              )}

              {/* Store Items */}
              {storeItems && storeItems.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-sm font-medium text-white/70 px-1">
                    {language === "pt" ? "Produtos Digitais" : "Digital Products"}
                  </h3>
                  {storeItems.map((item) => (
                    <StoreItemCard 
                      key={item.id} 
                      item={item} 
                      language={language}
                      onPurchase={handleStorePurchase}
                      isLoading={isCheckingOut && checkoutProductId === item.id}
                    />
                  ))}
                </div>
              )}

              {/* Recommended Products */}
              {recommendedProducts && recommendedProducts.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-sm font-medium text-white/70 px-1">
                    {language === "pt" ? "Produtos Recomendados" : "Recommended Products"}
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

              {/* Empty state */}
              {(!premiumOffers || premiumOffers.length === 0) && 
               (!storeItems || storeItems.length === 0) && 
               (!recommendedProducts || recommendedProducts.length === 0) && (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">
                    {language === "pt" ? "Brevemente novos produtos" : "New products coming soon"}
                  </p>
                </div>
              )}

              {/* Affiliate disclaimer */}
              <div className="p-3 rounded-xl bg-white/5 mt-4">
                <p className="text-[10px] text-white/40 text-center">
                  {language === "pt"
                    ? "Alguns links são links de afiliados. Podemos ganhar uma pequena comissão sem custo extra para si."
                    : "Some links are affiliate links. We may earn a small commission at no extra cost to you."}
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        // Academy Content List
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-white/60">
                {cms.get("academy.empty.title")}
              </p>
            </div>
          ) : (
            <>
              {/* Featured Item */}
              {featuredItems.length > 0 && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <h2 className="text-sm font-medium text-white/70 mb-3 px-1">
                    {cms.get("academy.featured.title")}
                  </h2>
                  <CourseCard course={featuredItems[0]} featured index={0} />
                </motion.div>
              )}

              {/* Regular Items */}
              {regularItems.length > 0 ? (
                <div className="space-y-3">
                  {!searchQuery && featuredItems.length > 0 && (
                    <h2 className="text-sm font-medium text-white/70 mb-3 px-1">
                      {activeType === "course"
                        ? cms.get("academy.allCourses.title")
                        : activeType === "program"
                          ? cms.get("academy.allPrograms.title")
                          : cms.get("academy.moreContent.title")}
                    </h2>
                  )}
                  
                  {regularItems.map((item, index) =>
                    item.item_type === "course" || item.item_type === "program" ? (
                      <CourseCard key={item.id} course={item} index={index} />
                    ) : (
                      <AcademyCard key={item.id} item={item} />
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">
                    {searchQuery
                      ? cms.get("academy.empty.noResults")
                      : cms.get("academy.empty.title")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Info Banner */}
      {!isStoreTab && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white text-center">
            {cms.get("academy.footer.disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}
