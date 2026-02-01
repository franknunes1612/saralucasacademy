import { ExternalLink, Package } from "lucide-react";
import { useRecommendedProducts, RecommendedProduct } from "@/hooks/useRecommendedProducts";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardProps {
  product: RecommendedProduct;
  language: "pt" | "en";
}

function ProductCard({ product, language }: ProductCardProps) {
  const name = language === "pt" ? product.name_pt : product.name_en;
  const description = language === "pt" ? product.description_pt : product.description_en;

  const handleClick = () => {
    if (product.external_link) {
      window.open(product.external_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!product.external_link}
      className="result-card p-4 text-left hover:bg-white/5 transition-all duration-200 flex flex-col h-full min-w-[160px] w-40 flex-shrink-0 group"
    >
      {/* Image */}
      <div className="w-full aspect-square rounded-xl bg-white/10 mb-3 overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-4xl">{product.image_emoji || "📦"}</span>
        )}
      </div>

      {/* Brand tag */}
      {product.brand && (
        <span className="text-[10px] text-white/70 font-medium uppercase tracking-wide mb-1">
          {product.brand}
        </span>
      )}

      {/* Name */}
      <h4 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2">
        {name}
      </h4>

      {/* Description */}
      {description && (
        <p className="text-[11px] text-white/60 line-clamp-2 mb-3 flex-1">
          {description}
        </p>
      )}

      {/* CTA */}
      <div className="flex items-center gap-1 text-xs text-white/80 font-medium mt-auto pt-2 group-hover:text-white transition-colors">
        <span>{language === "pt" ? "Ver Produto" : "View Product"}</span>
        <ExternalLink className="h-3 w-3" />
      </div>
    </button>
  );
}

export function RecommendedProductsSection() {
  const { t, language } = useLanguage();
  const { data: products, isLoading } = useRecommendedProducts();

  // Hide section if no products
  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-white">
          {t({ pt: "Produtos Recomendados da Semana", en: "Weekly Recommended Products" })}
        </h2>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-white/60 mb-4">
        {t({
          pt: "Selecionados pela Sara Lucas para ti",
          en: "Hand-picked by Sara Lucas for you",
        })}
      </p>

      {/* Products carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {isLoading ? (
          <>
            <Skeleton className="w-40 h-56 rounded-2xl flex-shrink-0" />
            <Skeleton className="w-40 h-56 rounded-2xl flex-shrink-0" />
            <Skeleton className="w-40 h-56 rounded-2xl flex-shrink-0" />
          </>
        ) : (
          products?.map((product) => (
            <ProductCard key={product.id} product={product} language={language} />
          ))
        )}
      </div>
    </section>
  );
}
