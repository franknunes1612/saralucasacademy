import { ExternalLink, BookOpen, PlayCircle, Calendar, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { AcademyItem, AcademyItemType } from "@/hooks/useAcademyItems";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  AcademyItemType,
  { icon: typeof BookOpen; color: string; label: { pt: string; en: string } }
> = {
  ebook: {
    icon: BookOpen,
    color: "bg-blue-500/20 text-blue-300",
    label: { pt: "Ebook", en: "Ebook" },
  },
  course: {
    icon: PlayCircle,
    color: "bg-purple-500/20 text-purple-300",
    label: { pt: "Curso", en: "Course" },
  },
  program: {
    icon: Calendar,
    color: "bg-green-500/20 text-green-300",
    label: { pt: "Programa", en: "Program" },
  },
  bundle: {
    icon: Package,
    color: "bg-orange-500/20 text-orange-300",
    label: { pt: "Bundle", en: "Bundle" },
  },
};

interface AcademyCardProps {
  item: AcademyItem;
  compact?: boolean;
}

export function AcademyCard({ item, compact = false }: AcademyCardProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const config = TYPE_CONFIG[item.item_type];
  const Icon = config.icon;

  const title = language === "pt" ? item.title_pt : item.title_en;
  const subtitle = language === "pt" ? item.subtitle_pt : item.subtitle_en;
  const description = language === "pt" ? item.description_pt : item.description_en;
  const badge = language === "pt" ? item.badge_pt : item.badge_en;

  const hasDiscount = item.original_price && item.original_price > item.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.original_price! - item.price) / item.original_price!) * 100)
    : 0;

  const formatPrice = (price: number) => {
    const symbol = item.currency === "EUR" ? "€" : item.currency === "USD" ? "$" : "£";
    return `${symbol}${price.toFixed(2)}`;
  };

  const handleClick = () => {
    // Navigate to detail page for all item types (courses, programs, ebooks, bundles)
    // This allows in-app purchase via Stripe
    if (item.item_type === "course" || item.item_type === "program") {
      const itemType = item.item_type === "program" ? "program" : "course";
      navigate(`/learn/${itemType}/${item.id}`);
    } else if (item.item_type === "ebook" || item.item_type === "bundle") {
      // Navigate to course detail page which can handle all types
      navigate(`/learn/course/${item.id}`);
    } else if (item.purchase_link) {
      // Fallback for external links
      window.open(item.purchase_link, "_blank", "noopener,noreferrer");
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="result-card p-4 w-40 flex-shrink-0 text-left hover:scale-[1.02] transition-transform"
      >
        {/* Cover */}
        <div className="aspect-[4/3] rounded-xl bg-white/10 flex items-center justify-center mb-3 overflow-hidden">
          {item.cover_image_url ? (
            <img
              src={item.cover_image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">{item.cover_emoji || "📚"}</span>
          )}
        </div>

        {/* Type badge */}
        <div className="flex items-center gap-1 mb-1">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", config.color)}>
            {t(config.label)}
          </span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">{title}</h3>

        {/* Price */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-white">{formatPrice(item.price)}</span>
          {hasDiscount && (
            <span className="text-[10px] text-white/50 line-through">
              {formatPrice(item.original_price!)}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="result-card p-4 w-full text-left hover:bg-white/5 transition-colors"
    >
      <div className="flex gap-4">
        {/* Cover */}
        <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.cover_image_url ? (
            <img
              src={item.cover_image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">{item.cover_emoji || "📚"}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", config.color)}>
                {t(config.label)}
              </span>
              {badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/20 text-success font-medium">
                  {badge}
                </span>
              )}
              {hasDiscount && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">
                  -{discountPercent}%
                </span>
              )}
            </div>
            {item.purchase_link && (
              <ExternalLink className="h-4 w-4 text-white/40 flex-shrink-0" />
            )}
          </div>

          <h3 className="font-semibold text-white line-clamp-1 mb-0.5">{title}</h3>

          {subtitle && (
            <p className="text-xs text-white/60 line-clamp-1 mb-1">{subtitle}</p>
          )}

          {item.duration_label && (
            <p className="text-[10px] text-white/50 mb-2">{item.duration_label}</p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">{formatPrice(item.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-white/50 line-through">
                {formatPrice(item.original_price!)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
