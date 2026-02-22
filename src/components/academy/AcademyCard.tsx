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
    color: "bg-blue-500/15 text-blue-600",
    label: { pt: "Ebook", en: "Ebook" },
  },
  course: {
    icon: PlayCircle,
    color: "bg-purple-500/15 text-purple-600",
    label: { pt: "Curso", en: "Course" },
  },
  program: {
    icon: Calendar,
    color: "bg-green-500/15 text-green-600",
    label: { pt: "Programa", en: "Program" },
  },
  bundle: {
    icon: Package,
    color: "bg-orange-500/15 text-orange-600",
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
    if (item.item_type === "course" || item.item_type === "program") {
      const itemType = item.item_type === "program" ? "program" : "course";
      navigate(`/learn/${itemType}/${item.id}`);
    } else if (item.item_type === "ebook") {
      navigate(`/learn/ebook/${item.id}`);
    } else if (item.item_type === "bundle") {
      navigate(`/learn/bundle/${item.id}`);
    } else if (item.purchase_link) {
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
        <div className="rounded-xl bg-muted flex items-center justify-center mb-3 overflow-hidden">
          {item.cover_image_url ? (
            <img src={item.cover_image_url} alt={title} className="w-full h-auto" />
          ) : (
            <div className="aspect-[4/3] w-full flex items-center justify-center">
              <span className="text-4xl">{item.cover_emoji || "📚"}</span>
            </div>
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
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{title}</h3>

        {/* Price */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through">
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
      className="result-card p-4 w-full text-left hover:shadow-md transition-all"
    >
      <div className="flex gap-4">
        {/* Cover */}
        <div className="w-24 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.cover_image_url ? (
            <img src={item.cover_image_url} alt={title} className="w-full h-auto" />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center">
              <span className="text-3xl">{item.cover_emoji || "📚"}</span>
            </div>
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
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>

          <h3 className="font-semibold text-foreground line-clamp-1 mb-0.5">{title}</h3>

          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{subtitle}</p>
          )}

          {item.duration_label && (
            <p className="text-[10px] text-muted-foreground mb-2">{item.duration_label}</p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">{formatPrice(item.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(item.original_price!)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
