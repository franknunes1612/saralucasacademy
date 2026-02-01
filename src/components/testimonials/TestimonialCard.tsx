import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Testimonial } from "@/hooks/useTestimonials";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

const CATEGORY_LABELS: Record<string, { pt: string; en: string }> = {
  training: { pt: "Treino", en: "Training" },
  nutrition: { pt: "Nutrição", en: "Nutrition" },
  course: { pt: "Curso", en: "Course" },
  consultation: { pt: "Consulta", en: "Consultation" },
  general: { pt: "Geral", en: "General" },
};

const CATEGORY_COLORS: Record<string, string> = {
  training: "bg-[hsl(340_50%_45%)]/30 text-[hsl(340_60%_85%)]",
  nutrition: "bg-[hsl(30_60%_45%)]/30 text-[hsl(30_70%_80%)]",
  course: "bg-[hsl(280_50%_50%)]/30 text-[hsl(280_60%_85%)]",
  consultation: "bg-[hsl(200_50%_45%)]/30 text-[hsl(200_60%_85%)]",
  general: "bg-white/15 text-white/90",
};

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const { language } = useLanguage();
  const text = language === "pt" ? testimonial.text_pt : testimonial.text_en;
  const categoryLabel = CATEGORY_LABELS[testimonial.category]?.[language] || testimonial.category;
  const categoryColor = CATEGORY_COLORS[testimonial.category] || CATEGORY_COLORS.general;

  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 transition-all duration-300",
        "bg-gradient-to-br from-white/[0.08] to-white/[0.03]",
        "border border-white/10 hover:border-white/20",
        "shadow-lg hover:shadow-xl",
        className
      )}
    >
      {/* Decorative quote icon */}
      <Quote className="absolute top-4 right-4 h-6 w-6 text-white/10" />

      {/* Rating stars */}
      {testimonial.rating && (
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < testimonial.rating!
                  ? "fill-[hsl(45_90%_60%)] text-[hsl(45_90%_60%)]"
                  : "text-white/20"
              )}
            />
          ))}
        </div>
      )}

      {/* Testimonial text */}
      <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3">
        "{text}"
      </p>

      {/* Author info */}
      <div className="flex items-center gap-3">
        {testimonial.photo_url ? (
          <img
            src={testimonial.photo_url}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(340_50%_60%)] to-[hsl(30_50%_60%)] flex items-center justify-center ring-2 ring-white/10">
            <span className="text-white font-semibold text-sm">
              {testimonial.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">
            {testimonial.name}
          </p>
          <span
            className={cn(
              "inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1",
              categoryColor
            )}
          >
            {categoryLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
