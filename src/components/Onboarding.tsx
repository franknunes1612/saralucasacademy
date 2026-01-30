import { useState } from "react";
import { 
  BookOpen, 
  MessageCircle, 
  Sparkles, 
  GraduationCap,
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";

interface OnboardingProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  titleKey: string;
  textKey: string;
  titleFallback: { pt: string; en: string };
  textFallback: { pt: string; en: string };
  icon: React.ReactNode;
  illustration: React.ReactNode;
}

// Slide 1: Welcome / Brand illustration
const WelcomeIllustration = () => (
  <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
    {/* Central logo circle */}
    <div className="relative w-32 h-32 rounded-full bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center">
      <span className="font-signature text-3xl text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        SL
      </span>
    </div>
    {/* Floating elements */}
    <div className="absolute top-2 right-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
      <span className="text-lg">🍎</span>
    </div>
    <div className="absolute bottom-6 left-2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
      <span className="text-lg">💪</span>
    </div>
    <div className="absolute top-8 left-6 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
      <span className="text-sm">📚</span>
    </div>
    {/* Sparkles */}
    <Sparkles className="absolute top-0 left-1/2 h-5 w-5 text-white/60 animate-pulse" />
    <Sparkles className="absolute bottom-4 right-6 h-4 w-4 text-white/50 animate-pulse" style={{ animationDelay: "500ms" }} />
    {/* Glow ring */}
    <div className="absolute inset-0 w-32 h-32 m-auto rounded-full border-2 border-white/10 animate-ping" style={{ animationDuration: "3s" }} />
  </div>
);

// Slide 2: Professional guidance illustration
const GuidanceIllustration = () => (
  <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
    {/* Person with stethoscope */}
    <div className="relative w-28 h-28 rounded-full bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center">
      <span className="text-5xl">👩‍⚕️</span>
    </div>
    {/* Chat bubble */}
    <div className="absolute -right-2 top-6 bg-white/25 border border-white/30 rounded-2xl rounded-br-sm px-3 py-2 shadow-lg">
      <MessageCircle className="h-5 w-5 text-white" />
    </div>
    {/* Clipboard */}
    <div className="absolute bottom-4 -left-2 bg-white/20 border border-white/25 rounded-lg px-2 py-1.5 shadow-lg">
      <div className="flex flex-col gap-0.5">
        <div className="w-8 h-1 bg-white/50 rounded" />
        <div className="w-6 h-1 bg-white/40 rounded" />
        <div className="w-7 h-1 bg-white/40 rounded" />
      </div>
    </div>
    {/* Language badges */}
    <div className="absolute bottom-2 right-4 px-2 py-1 rounded-full bg-white/20 text-xs text-white font-medium">
      🇵🇹 🇬🇧
    </div>
    <Sparkles className="absolute top-2 left-8 h-5 w-5 text-white/60 animate-pulse" />
  </div>
);

// Slide 3: Tools illustration
const ToolsIllustration = () => (
  <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
    {/* Phone with scanner */}
    <div className="relative w-24 h-40 rounded-3xl bg-white/15 border-2 border-white/30 overflow-hidden shadow-xl">
      <div className="absolute inset-2 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
        {/* Camera viewfinder */}
        <div className="absolute inset-3 rounded-lg border-2 border-dashed border-white/40 flex items-center justify-center">
          <span className="text-2xl">🥗</span>
        </div>
        {/* Scan corners */}
        <div className="absolute top-3 left-3 w-3 h-3 border-l-2 border-t-2 border-white/70 rounded-tl" />
        <div className="absolute top-3 right-3 w-3 h-3 border-r-2 border-t-2 border-white/70 rounded-tr" />
        <div className="absolute bottom-10 left-3 w-3 h-3 border-l-2 border-b-2 border-white/70 rounded-bl" />
        <div className="absolute bottom-10 right-3 w-3 h-3 border-r-2 border-b-2 border-white/70 rounded-br" />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-primary" />
      </div>
    </div>
    {/* Recipe card */}
    <div className="absolute -right-4 top-6 w-16 h-20 rounded-xl bg-white/20 border border-white/25 shadow-lg p-2">
      <div className="text-center text-lg mb-1">🍳</div>
      <div className="space-y-1">
        <div className="h-1 bg-white/40 rounded" />
        <div className="h-1 bg-white/30 rounded w-3/4" />
      </div>
    </div>
    {/* Course icon */}
    <div className="absolute -left-2 bottom-8 w-12 h-12 rounded-full bg-white/20 border border-white/25 flex items-center justify-center shadow-lg">
      <BookOpen className="h-5 w-5 text-white" />
    </div>
  </div>
);

// Slide 4: Learn at your pace illustration
const LearnIllustration = () => (
  <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
    {/* Central graduation cap */}
    <div className="relative w-28 h-28 rounded-full bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center">
      <GraduationCap className="h-12 w-12 text-white" />
    </div>
    {/* Ebook */}
    <div className="absolute top-4 -right-2 w-14 h-18 rounded-lg bg-white/20 border border-white/25 shadow-lg p-1.5">
      <div className="h-full rounded bg-white/15 flex items-center justify-center">
        <span className="text-lg">📖</span>
      </div>
    </div>
    {/* Video course */}
    <div className="absolute bottom-6 -left-4 w-16 h-12 rounded-lg bg-white/20 border border-white/25 shadow-lg flex items-center justify-center">
      <div className="w-0 h-0 border-l-8 border-l-white/70 border-y-4 border-y-transparent ml-1" />
    </div>
    {/* Products */}
    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
      <span className="text-lg">🛒</span>
    </div>
    <Sparkles className="absolute top-0 left-1/3 h-5 w-5 text-white/60 animate-pulse" />
    <Sparkles className="absolute bottom-8 right-1/4 h-4 w-4 text-white/50 animate-pulse" style={{ animationDelay: "700ms" }} />
  </div>
);

// Slide configuration with CMS keys and fallbacks
const SLIDES: OnboardingSlide[] = [
  {
    titleKey: "onboarding.slide1.title",
    textKey: "onboarding.slide1.text",
    titleFallback: { pt: "Sara Lucas Academy", en: "Sara Lucas Academy" },
    textFallback: { 
      pt: "Nutrição, treino e acompanhamento profissional num só lugar.", 
      en: "Nutrition, training, and professional guidance in one place." 
    },
    icon: <BookOpen className="h-6 w-6" />,
    illustration: <WelcomeIllustration />,
  },
  {
    titleKey: "onboarding.slide2.title",
    textKey: "onboarding.slide2.text",
    titleFallback: { pt: "Acompanhamento Profissional", en: "Professional Guidance" },
    textFallback: { 
      pt: "Consulta com nutricionista, planos personalizados e orientação real.", 
      en: "Nutritionist consultations, personalized plans, and real guidance." 
    },
    icon: <MessageCircle className="h-6 w-6" />,
    illustration: <GuidanceIllustration />,
  },
  {
    titleKey: "onboarding.slide3.title",
    textKey: "onboarding.slide3.text",
    titleFallback: { pt: "Ferramentas Inteligentes", en: "Smart Tools" },
    textFallback: { 
      pt: "Scan alimentar, receitas fit, cursos e conteúdos exclusivos.", 
      en: "Food scanner, fit recipes, courses, and exclusive content." 
    },
    icon: <Sparkles className="h-6 w-6" />,
    illustration: <ToolsIllustration />,
  },
  {
    titleKey: "onboarding.slide4.title",
    textKey: "onboarding.slide4.text",
    titleFallback: { pt: "Aprende ao Teu Ritmo", en: "Learn at Your Pace" },
    textFallback: { 
      pt: "Ebooks, cursos de treino e nutrição, produtos recomendados.", 
      en: "Ebooks, training and nutrition courses, recommended products." 
    },
    icon: <GraduationCap className="h-6 w-6" />,
    illustration: <LearnIllustration />,
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const { language } = useLanguage();
  const { get } = useCmsContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  // Get content from CMS with fallback
  const title = get(slide.titleKey, slide.titleFallback);
  const text = get(slide.textKey, slide.textFallback);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const buttonLabels = {
    skip: language === "pt" ? "Saltar" : "Skip",
    back: language === "pt" ? "Voltar" : "Back",
    next: language === "pt" ? "Seguinte" : "Next",
    enter: language === "pt" ? "Entrar" : "Enter",
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: `linear-gradient(
          165deg,
          hsl(340 50% 78%) 0%,
          hsl(340 45% 72%) 40%,
          hsl(340 40% 68%) 100%
        )`,
      }}
    >
      {/* Skip button */}
      <div className="flex justify-end p-4 safe-top">
        <button
          onClick={handleSkip}
          className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1"
        >
          {buttonLabels.skip}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Illustration */}
        <div className="mb-10 animate-fade-in" key={`illustration-${currentSlide}`}>
          {slide.illustration}
        </div>

        {/* Text content */}
        <div className="text-center max-w-xs animate-fade-in" key={`text-${currentSlide}`}>
          <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-white/75 text-base leading-relaxed">
            {text}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 safe-bottom space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/30 w-2.5 hover:bg-white/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-4 rounded-xl bg-white/15 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/25 transition-colors border border-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
              {buttonLabels.back}
            </button>
          )}
          <button
            onClick={handleNext}
            className={cn(
              "flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
              "bg-white text-primary shadow-lg hover:shadow-xl hover:bg-white/95"
            )}
            style={{ color: "hsl(340 45% 45%)" }}
          >
            {isLast ? buttonLabels.enter : buttonLabels.next}
            {!isLast && <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
