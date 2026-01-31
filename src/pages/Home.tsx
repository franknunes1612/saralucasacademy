import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Utensils, MessageCircle, ChevronRight, Sparkles, BookOpen, Users, Instagram, LogIn } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useFeaturedAcademyItems } from "@/hooks/useAcademyItems";
import { AcademyCard } from "@/components/academy/AcademyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { SaraLucasLogo } from "@/components/brand/SaraLucasLogo";
import { RecommendedProductsSection } from "@/components/home/RecommendedProductsSection";
import { LanguageToggle } from "@/components/LanguageToggle";
import { AuthModal } from "@/components/auth/AuthModal";
import saraPortrait from "@/assets/sara-lucas-portrait.png";

const INSTAGRAM_URL = "https://www.instagram.com/saralucas_pt_nutricionista/";

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAdmin, user } = useAuth();
  const { data: featuredItems, isLoading } = useFeaturedAcademyItems();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleWhatsApp = () => {
    const message = language === "pt" 
      ? "Olá, sou utilizador da app Sara Lucas e gostaria de agendar uma consulta."
      : "Hi, I'm a Sara Lucas app user and I'd like to book a consultation.";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/351939535077?text=${encodedMessage}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SaraLucasLogo size="lg" />
          <p className="text-sm text-white/70 mt-0.5">
            {t({ pt: "Academia de Nutrição & Treino", en: "Nutrition & Training Academy" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
          </a>
          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label={t({ pt: "Entrar", en: "Sign In" })}
            >
              <LogIn className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Admin"
            >
              <Sparkles className="h-5 w-5 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Card with Sara's Photo */}
      <div className="result-card p-6 mb-6 overflow-hidden">
        <div className="flex gap-4">
          {/* Portrait */}
          <div className="flex-shrink-0 w-24 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
            <img
              src={saraPortrait}
              alt="Sara Lucas - Nutricionista"
              className="w-full h-full object-cover object-top"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white leading-tight mb-1">
              {t({ pt: "Olá, sou a Sara Lucas", en: "Hi, I'm Sara Lucas" })}
            </h2>
            <p className="text-sm text-white/70 mb-2">
              {t({ pt: "Nutricionista / Personal Trainer Certificada", en: "Certified Nutritionist / Personal Trainer" })}
            </p>
            <p className="text-xs text-white/60 line-clamp-2">
              {t({
                pt: "Ajudo-te a transformar a tua alimentação e alcançar os teus objetivos.",
                en: "I help you transform your nutrition and reach your goals.",
              })}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => navigate("/learn")}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {t({ pt: "Explorar Academia", en: "Explore Academy" })}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => navigate("/tools")}
          className="result-card p-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="p-3 rounded-xl bg-success/20 text-success w-fit mb-2">
            <Utensils className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-white text-sm mb-0.5">
            {t({ pt: "Ferramentas", en: "Tools" })}
          </h3>
          <p className="text-[11px] text-white/60">
            {t({ pt: "Scanner de alimentos e mais", en: "Food scanner and more" })}
          </p>
        </button>

        <button
          onClick={handleWhatsApp}
          className="result-card p-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="p-3 rounded-xl bg-secondary/20 text-secondary w-fit mb-2">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-white text-sm mb-0.5">
            {t({ pt: "Consulta", en: "Consultation" })}
          </h3>
          <p className="text-[11px] text-white/60">
            {t({ pt: "Falar com nutricionista", en: "Talk to nutritionist" })}
          </p>
        </button>
      </div>

      {/* Featured Academy Content */}
      {(isLoading || (featuredItems && featuredItems.length > 0)) && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">
              {t({ pt: "Em Destaque", en: "Featured" })}
            </h2>
            <button
              onClick={() => navigate("/learn")}
              className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
            >
              {t({ pt: "Ver tudo", en: "See all" })}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {isLoading ? (
              <>
                <Skeleton className="w-40 h-48 rounded-2xl flex-shrink-0" />
                <Skeleton className="w-40 h-48 rounded-2xl flex-shrink-0" />
                <Skeleton className="w-40 h-48 rounded-2xl flex-shrink-0" />
              </>
            ) : (
              featuredItems?.map((item) => (
                <AcademyCard key={item.id} item={item} compact />
              ))
            )}
          </div>
        </section>
      )}

      {/* Recommended Products Section */}
      <RecommendedProductsSection />

      {/* Categories Preview */}
      <section className="mb-6">
        <h2 className="font-semibold text-white mb-3">
          {t({ pt: "Categorias", en: "Categories" })}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/learn?type=ebook")}
            className="result-card p-4 text-center hover:bg-white/5 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-secondary mx-auto mb-2" />
            <span className="text-sm font-medium text-white">
              {t({ pt: "Ebooks", en: "Ebooks" })}
            </span>
          </button>
          <button
            onClick={() => navigate("/learn?type=course")}
            className="result-card p-4 text-center hover:bg-white/5 transition-colors"
          >
            <GraduationCap className="h-6 w-6 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-white">
              {t({ pt: "Cursos", en: "Courses" })}
            </span>
          </button>
          <button
            onClick={() => navigate("/learn?type=program")}
            className="result-card p-4 text-center hover:bg-white/5 transition-colors"
          >
            <Users className="h-6 w-6 text-success mx-auto mb-2" />
            <span className="text-sm font-medium text-white">
              {t({ pt: "Programas", en: "Programs" })}
            </span>
          </button>
          <button
            onClick={() => navigate("/learn?type=bundle")}
            className="result-card p-4 text-center hover:bg-white/5 transition-colors"
          >
            <Sparkles className="h-6 w-6 text-warning mx-auto mb-2" />
            <span className="text-sm font-medium text-white">
              {t({ pt: "Bundles", en: "Bundles" })}
            </span>
          </button>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="result-card p-5">
        <h3 className="font-semibold text-white mb-3">
          {t({ pt: "Porque a Sara Lucas Academy?", en: "Why Sara Lucas Academy?" })}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-white/80">
            <span className="text-success mt-0.5">✓</span>
            {t({ pt: "Conteúdo criado por nutricionista certificada", en: "Content created by certified nutritionist" })}
          </li>
          <li className="flex items-start gap-2 text-sm text-white/80">
            <span className="text-success mt-0.5">✓</span>
            {t({ pt: "Acesso vitalício aos materiais comprados", en: "Lifetime access to purchased materials" })}
          </li>
          <li className="flex items-start gap-2 text-sm text-white/80">
            <span className="text-success mt-0.5">✓</span>
            {t({ pt: "Ferramentas práticas incluídas", en: "Practical tools included" })}
          </li>
          <li className="flex items-start gap-2 text-sm text-white/80">
            <span className="text-success mt-0.5">✓</span>
            {t({ pt: "Suporte por WhatsApp", en: "WhatsApp support" })}
          </li>
        </ul>
      </section>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
