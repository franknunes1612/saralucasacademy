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
  Shield
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
    <section className="py-12 -mx-4">
      {/* Full-width container with seamless pink gradient */}
      <div className="relative overflow-hidden">
        {/* Seamless brand pink gradient - no breaks or blocks */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary to-primary/95" />
        
        {/* Soft glow elements for depth */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-white/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-5 py-10 max-w-lg mx-auto">
          {/* Badge pill */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold text-white uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              {badge}
            </span>
          </div>

          {/* Main title - Pure white, maximum contrast */}
          <h2 
            className="text-3xl sm:text-4xl font-black text-white text-center mb-4 tracking-tight leading-tight drop-shadow-lg"
          >
            {title}
          </h2>

          {/* Subtitle - High opacity white */}
          <p 
            className="text-base sm:text-lg text-white/95 text-center mb-8 leading-relaxed max-w-md mx-auto font-medium drop-shadow-md"
          >
            {subtitle}
          </p>

          {/* Authority badge - Soft white pill */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/25 backdrop-blur-sm border border-white/35 shadow-lg">
              <Award className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white tracking-wide">
                {authority}
              </span>
            </div>
          </div>

          {/* Feature Cards Grid - Elevated white cards */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const IconComponent = ICON_MAP[feature.icon] || CheckCircle2;
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl p-5 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-white/80"
                  style={{ 
                    boxShadow: '0 8px 32px -8px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)' 
                  }}
                >
                  {/* Icon container - Brand pink accent */}
                  <div className="mb-4 p-3 w-fit rounded-xl bg-primary/15 border border-primary/20">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>

                  {/* Title - Strong dark text */}
                  <h3 className="text-sm font-extrabold text-foreground mb-2 leading-tight">
                    {feature.title}
                  </h3>

                  {/* Description - Readable dark gray */}
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {feature.description}
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
