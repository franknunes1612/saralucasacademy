import React from "react";
import { motion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSmartTestimonials, Testimonial } from "@/hooks/useTestimonials";
import { useIsMobile } from "@/hooks/use-mobile";
import { TestimonialCard } from "./TestimonialCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  productId?: string;
  location?: "academy" | "homepage";
  title?: string;
  className?: string;
  maxItems?: number;
}

export const TestimonialsSection = React.forwardRef<HTMLElement, TestimonialsSectionProps>(
  function TestimonialsSection({
  productId,
  location = "academy",
  title,
  className,
  maxItems = 6,
}, ref) {
  const { t } = useLanguage();
  const cms = useCmsContent();
  const isMobile = useIsMobile();
  const { data: testimonials, isLoading } = useSmartTestimonials(productId, location);

  // Don't render if no testimonials
  if (!isLoading && (!testimonials || testimonials.length === 0)) {
    return null;
  }

  const displayedTestimonials = testimonials?.slice(0, maxItems) || [];
  const sectionTitle = title || cms.get("testimonials.section.title", {
    pt: "O que dizem os nossos alunos",
    en: "What our students say",
  });

  return (
    <section ref={ref} className={cn("py-6", className)}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 mb-4 px-1"
      >
        <MessageSquareQuote className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          {sectionTitle}
        </h2>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : isMobile ? (
        /* Mobile: Carousel */
        <Carousel
          opts={{
            align: "start",
            loop: displayedTestimonials.length > 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {displayedTestimonials.map((testimonial, index) => (
              <CarouselItem key={testimonial.id} className="pl-3 basis-[85%]">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <TestimonialCard testimonial={testimonial} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Carousel Dots */}
          {displayedTestimonials.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {displayedTestimonials.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-primary/30"
                />
              ))}
            </div>
          )}
        </Carousel>
      ) : (
        /* Desktop: Grid */
        <div className="grid grid-cols-3 gap-4">
          {displayedTestimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
});
