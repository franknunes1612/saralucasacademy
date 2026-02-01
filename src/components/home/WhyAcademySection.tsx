import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { 
  Award, 
  Target, 
  BookOpen, 
  Heart, 
  CheckCircle2, 
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  ChevronRight
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  target: Target,
  book: BookOpen,
  heart: Heart,
  check: CheckCircle2,
  sparkles: Sparkles,
  users: Users,
  trending: TrendingUp,
  shield: Shield,
};

/**
 * Premium "Why Sara Lucas Academy?" section
 * High-impact, scroll-stopping design
 * All content controlled via CMS (home.whyAcademy.*)
 */
export function WhyAcademySection() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const cms = useCmsContent();

  // Check if section is enabled
  const isEnabled = cms.get("home.whyAcademy.enabled", { pt: "true", en: "true" }) === "true";
  if (!isEnabled) return null;

  // Badge text
  const badge = cms.get("home.whyAcademy.badge", {
    pt: "Porque escolher a Sara Lucas Academy",
    en: "Why choose Sara Lucas Academy",
  });

  // Main title
  const title = cms.get("home.whyAcademy.title", {
    pt: "Uma Transformação Real",
    en: "A Real Transformation",
  });

  // Emotional subtitle
  const subtitle = cms.get("home.whyAcademy.subtitle", {
    pt: "Mais do que conhecimento — orientação profissional para resultados que duram.",
    en: "More than knowledge — professional guidance for results that last.",
  });

  // Authority text
  const authority = cms.get("home.whyAcademy.authority", {
    pt: "Nutricionista & Personal Trainer Certificada",
    en: "Certified Nutritionist & Personal Trainer",
  });

  // CTA enabled
  const ctaEnabled = cms.get("home.whyAcademy.ctaEnabled", { pt: "true", en: "true" }) === "true";
  const ctaText = cms.get("home.whyAcademy.ctaText", {
    pt: "Explorar a Academia",
    en: "Explore the Academy",
  });

  // Feature cards (pipe-separated: icon|title|description)
  const featuresRaw = cms.get("home.whyAcademy.features", {
    pt: "award|Orientação Certificada|Acompanhamento por profissional com formação em nutrição e treino|target|Método Comprovado|Estratégias testadas que geram resultados reais e sustentáveis|book|Ciência & Experiência|Conteúdo baseado em evidência científica e prática clínica|heart|Resultados Duradouros|Transformações que respeitam o teu corpo e estilo de vida",
    en: "award|Certified Guidance|Support from a professional trained in nutrition and training|target|Proven Method|Tested strategies that generate real and sustainable results|book|Science & Experience|Content based on scientific evidence and clinical practice|heart|Lasting Results|Transformations that respect your body and lifestyle",
  });

  // Parse features
  const features: { icon: string; title: string; description: string }[] = [];
  const parts = featuresRaw.split("|");
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i] && parts[i + 1] && parts[i + 2]) {
      features.push({ 
        icon: parts[i].trim(), 
        title: parts[i + 1].trim(), 
        description: parts[i + 2].trim() 
      });
    }
  }

  return (
    <section className="mb-6 -mx-4">
      {/* Full-width premium container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-secondary/15 via-primary/8 to-[hsl(30,30%,85%)]/20 px-4 py-8">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[hsl(30,40%,80%)]/15 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg mx-auto">
          {/* Badge pill */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-white/80">
              <Sparkles className="h-3 w-3 text-secondary" />
              {badge}
            </span>
          </div>

          {/* Main title - Bold & Dominant */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3 tracking-tight leading-tight">
            {title}
          </h2>

          {/* Emotional subtitle */}
          <p className="text-sm sm:text-base text-white/70 text-center mb-6 leading-relaxed max-w-md mx-auto font-light">
            {subtitle}
          </p>

          {/* Authority badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20">
              <Award className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-secondary/90">
                {authority}
              </span>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature, index) => {
              const IconComponent = ICON_MAP[feature.icon] || CheckCircle2;
              return (
                <div
                  key={index}
                  className="group relative bg-white/8 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/12 hover:border-white/20 transition-all duration-300"
                >
                  {/* Icon container */}
                  <div className="mb-3 p-2.5 w-fit rounded-xl bg-gradient-to-br from-secondary/25 to-primary/15 group-hover:from-secondary/35 group-hover:to-primary/25 transition-colors">
                    <IconComponent className="h-5 w-5 text-secondary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-white mb-1 leading-tight">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] text-white/60 leading-snug">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Soft CTA */}
          {ctaEnabled && (
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/learn")}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm transition-all duration-300"
              >
                <span className="text-sm font-medium text-white">
                  {ctaText}
                </span>
                <ChevronRight className="h-4 w-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
