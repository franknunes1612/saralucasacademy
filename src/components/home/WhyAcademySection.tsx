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
 * High-impact, scroll-stopping design with strong contrast
 * All content controlled via CMS (home.whyAcademy.*)
 */
export function WhyAcademySection() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const cms = useCmsContent();

  // Check if section is enabled
  const isEnabled = cms.get("home.whyAcademy.enabled", { pt: "true", en: "true" }) === "true";
  if (!isEnabled) return null;

  // Visual settings from CMS
  const overlayOpacity = cms.get("home.whyAcademy.overlayOpacity", { pt: "15", en: "15" });
  const cardOpacity = cms.get("home.whyAcademy.cardOpacity", { pt: "90", en: "90" });

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
      {/* Full-width premium container with gradient */}
      <div className="relative overflow-hidden">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/25 via-primary/15 to-[hsl(30,35%,75%)]/30" />
        
        {/* Dark overlay for contrast */}
        <div 
          className="absolute inset-0 bg-black/[0.12]"
          style={{ opacity: parseInt(overlayOpacity) / 100 }}
        />

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-primary/12 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 py-8 max-w-lg mx-auto">
          {/* Badge pill - Strong contrast */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold text-white shadow-sm">
              <Sparkles className="h-3 w-3 text-white" />
              {badge}
            </span>
          </div>

          {/* Main title - Bold, Strong White with text shadow */}
          <h2 
            className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-3 tracking-tight leading-tight"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            {title}
          </h2>

          {/* Emotional subtitle - High opacity */}
          <p 
            className="text-sm sm:text-base text-white text-center mb-6 leading-relaxed max-w-md mx-auto font-medium opacity-95"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
          >
            {subtitle}
          </p>

          {/* Authority badge - Clear and readable */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/25 backdrop-blur-md border border-white/35 shadow-sm">
              <Award className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white tracking-wide">
                {authority}
              </span>
            </div>
          </div>

          {/* Feature Cards Grid - High opacity cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature, index) => {
              const IconComponent = ICON_MAP[feature.icon] || CheckCircle2;
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    backgroundColor: `rgba(255, 252, 250, ${parseInt(cardOpacity) / 100})`,
                  }}
                >
                  {/* Icon container */}
                  <div className="mb-3 p-2.5 w-fit rounded-xl bg-gradient-to-br from-primary/30 to-secondary/40 group-hover:from-primary/40 group-hover:to-secondary/50 transition-colors shadow-sm">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>

                  {/* Title - Strong contrast */}
                  <h3 className="text-sm font-bold text-foreground mb-1.5 leading-tight">
                    {feature.title}
                  </h3>

                  {/* Description - Readable */}
                  <p className="text-[11px] text-muted-foreground leading-snug font-medium">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Soft CTA - Strong visibility */}
          {ctaEnabled && (
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/learn")}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/95 hover:bg-white border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="text-sm font-bold text-foreground">
                  {ctaText}
                </span>
                <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
