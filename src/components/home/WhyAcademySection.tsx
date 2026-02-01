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
      {/* Full-width premium container - STRONG SOLID BACKGROUND */}
      <div className="relative overflow-hidden">
        {/* Deep, rich gradient background - NOT pastel */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(340,35%,45%)] via-[hsl(25,30%,40%)] to-[hsl(340,30%,38%)]" />
        
        {/* Dark overlay for extra depth */}
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: parseInt(overlayOpacity) / 100 * 0.3 }}
        />

        {/* Subtle decorative elements - muted */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[hsl(30,40%,50%)]/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 py-10 max-w-lg mx-auto">
          {/* Badge pill - High contrast */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(30,50%,70%)]" />
              {badge}
            </span>
          </div>

          {/* Main title - PURE WHITE, BOLD, LARGE */}
          <h2 
            className="text-3xl sm:text-4xl font-black text-white text-center mb-4 tracking-tight leading-tight"
            style={{ textShadow: "0 3px 12px rgba(0,0,0,0.4)" }}
          >
            {title}
          </h2>

          {/* Emotional subtitle - HIGH CONTRAST */}
          <p 
            className="text-base sm:text-lg text-white text-center mb-8 leading-relaxed max-w-md mx-auto font-semibold"
            style={{ textShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
          >
            {subtitle}
          </p>

          {/* Authority badge - SOLID, VISIBLE */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[hsl(30,40%,55%)] shadow-lg border border-[hsl(30,45%,65%)]">
              <Award className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white tracking-wide">
                {authority}
              </span>
            </div>
          </div>

          {/* Feature Cards Grid - SOLID WHITE CARDS */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => {
              const IconComponent = ICON_MAP[feature.icon] || CheckCircle2;
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl p-5 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  {/* Icon container - STRONG ACCENT COLOR */}
                  <div className="mb-4 p-3 w-fit rounded-xl bg-gradient-to-br from-[hsl(340,40%,50%)] to-[hsl(25,35%,45%)] shadow-md">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>

                  {/* Title - DARK, BOLD */}
                  <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-tight">
                    {feature.title}
                  </h3>

                  {/* Description - READABLE DARK TEXT */}
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Button - STRONG, SOLID, IMPOSSIBLE TO MISS */}
          {ctaEnabled && (
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/learn")}
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/50"
              >
                <span className="text-base font-black text-gray-900">
                  {ctaText}
                </span>
                <ChevronRight className="h-5 w-5 text-[hsl(340,40%,50%)] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
