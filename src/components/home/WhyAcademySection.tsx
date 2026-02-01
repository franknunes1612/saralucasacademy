import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { Award, Target, BookOpen, Heart, CheckCircle2 } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  target: Target,
  book: BookOpen,
  heart: Heart,
  check: CheckCircle2,
};

/**
 * Premium "Why Sara Lucas Academy?" section
 * All content controlled via CMS (home.whyAcademy.*)
 */
export function WhyAcademySection() {
  const { language } = useLanguage();
  const cms = useCmsContent();

  // Check if section is enabled
  const isEnabled = cms.get("home.whyAcademy.enabled", { pt: "true", en: "true" }) === "true";
  if (!isEnabled) return null;

  // Get CMS content
  const title = cms.get("home.whyAcademy.title", {
    pt: "Porquê a Sara Lucas Academy?",
    en: "Why Sara Lucas Academy?",
  });

  const intro = cms.get("home.whyAcademy.intro", {
    pt: "Mais do que conhecimento — uma transformação real e sustentável.",
    en: "More than knowledge — a real and sustainable transformation.",
  });

  // Value points (pipe-separated: icon|text)
  const valuePointsRaw = cms.get("home.whyAcademy.valuePoints", {
    pt: "award|Orientação profissional certificada|target|Metodologia estruturada e comprovada|book|Conteúdo baseado em ciência e experiência real|heart|Resultados sustentáveis e duradouros",
    en: "award|Certified professional guidance|target|Structured and proven methodology|book|Content based on science and real experience|heart|Sustainable and lasting results",
  });

  // Parse value points
  const valuePoints: { icon: string; text: string }[] = [];
  const parts = valuePointsRaw.split("|");
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1]) {
      valuePoints.push({ icon: parts[i], text: parts[i + 1] });
    }
  }

  return (
    <section className="mb-6">
      {/* Premium card with distinct styling */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/10 border border-secondary/20 p-6 shadow-lg shadow-secondary/5">
        {/* Decorative accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
            {title}
          </h2>

          {/* Intro paragraph */}
          <p className="text-sm text-white/70 mb-5 leading-relaxed">
            {intro}
          </p>

          {/* Value points */}
          <div className="space-y-3">
            {valuePoints.map((point, index) => {
              const IconComponent = ICON_MAP[point.icon] || CheckCircle2;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-secondary/20">
                    <IconComponent className="h-4 w-4 text-secondary" />
                  </div>
                  <p className="text-sm text-white/90 leading-snug pt-1.5">
                    {point.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
