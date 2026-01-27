import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ExternalLink } from "lucide-react";
import { useRecommendedProducts, type RecommendedProduct } from "@/hooks/useRecommendedProducts";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";

function ProductCard({ 
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
    <div className="result-card p-4">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
          {item.image_emoji || "📦"}
        </div>
        
        {/* Content */}
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
                className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : "text-white/40"}`} 
              />
            </button>
          </div>
          
          {description && (
            <p className="text-xs text-white/70 line-clamp-2 mb-2">{description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
              {language === "pt" ? "Produto recomendado" : "Recommended product"}
            </span>
            {item.external_link && (
              <button
                onClick={handleView}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                {language === "pt" ? "Ver produto" : "View product"}
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
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

export default function Products() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: items, isLoading, error } = useRecommendedProducts();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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

  const displayItems = showFavoritesOnly 
    ? items?.filter(item => favorites.has(item.id)) 
    : items;

  const favoriteCount = favorites.size;

  // Hide section if no products are active
  if (!isLoading && !error && (!items || items.length === 0)) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            {t({ pt: "Produtos Favoritos", en: "Favorite Products" })}
          </h1>
        </div>
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">
            {t({ pt: "Nenhum produto disponível", en: "No products available" })}
          </p>
        </div>
      </div>
    );
  }

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
        <div>
          <h1 className="text-xl font-bold text-white">
            {t({ pt: "Produtos Favoritos", en: "Favorite Products" })}
          </h1>
          <p className="text-xs text-white/60">
            {t({ pt: "Produtos recomendados por nutricionistas", en: "Products recommended by nutritionists" })}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setShowFavoritesOnly(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !showFavoritesOnly 
              ? "bg-primary text-primary-foreground" 
              : "bg-white/10 text-white/80 hover:bg-white/20"
          }`}
        >
          {t({ pt: "Todos", en: "All Products" })}
        </button>
        <button
          onClick={() => setShowFavoritesOnly(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            showFavoritesOnly 
              ? "bg-primary text-primary-foreground" 
              : "bg-white/10 text-white/80 hover:bg-white/20"
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          {t({ pt: "Favoritos", en: "Favorites" })} {favoriteCount > 0 && `(${favoriteCount})`}
        </button>
      </div>

      {/* Products list */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-white/60">
              {t({ pt: "Erro ao carregar produtos", en: "Error loading products" })}
            </p>
          </div>
        ) : displayItems && displayItems.length > 0 ? (
          displayItems.map((item) => (
            <ProductCard 
              key={item.id} 
              item={item}
              language={language}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">
              {showFavoritesOnly 
                ? t({ pt: "Sem favoritos", en: "No favorites yet" })
                : t({ pt: "Sem produtos", en: "No products yet" })
              }
            </p>
            {showFavoritesOnly && (
              <p className="text-xs text-white/40 mt-1">
                {t({ pt: "Toca no coração para guardar", en: "Tap the heart to save products" })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Affiliate disclaimer */}
      <div className="mt-6 p-3 rounded-xl bg-white/5">
        <p className="text-[10px] text-white/40 text-center">
          {t({
            pt: "Alguns links são links de afiliados. Podemos ganhar uma pequena comissão sem custo extra para si.",
            en: "Some links are affiliate links. We may earn a small commission at no extra cost to you."
          })}
        </p>
      </div>
    </div>
  );
}
