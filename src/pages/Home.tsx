import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLeadMagnet } from "@/hooks/useLeadMagnet";
import { useCheckout } from "@/hooks/useCheckout";
import { useStoreItems } from "@/hooks/useStoreItems";
import { SaraLucasLogo } from "@/components/brand/SaraLucasLogo";
import { AuthModal } from "@/components/auth/AuthModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { LanguageToggle } from "@/components/LanguageToggle";
import saraPortrait from "@/assets/sara-lucas-portrait.png";
import { Sparkles, ChevronRight, Instagram, Loader2, CheckCircle2 } from "lucide-react";
import { openWhatsApp, WHATSAPP_MESSAGES, INSTAGRAM_URL } from "@/lib/constants";

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAdmin, user } = useAuth();
  const { data: profile } = useUserProfile();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isPt = language === "pt";

  const leadMagnet = useLeadMagnet("homepage_guide");
  const { checkout, isLoading: checkoutLoading } = useCheckout({ onError: () => setShowAuthModal(true) });
  const { data: storeItems } = useStoreItems();

  const getInitials = () => {
    if (profile?.display_name) return profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };


  return (
    <div className="min-h-screen bg-warm-white text-espresso">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-16 py-4 bg-warm-white/90 backdrop-blur-md border-b border-primary/10">
        <SaraLucasLogo size="lg" />

        <div className="hidden md:flex gap-10">
          <a href="#method" className="text-xs tracking-widest uppercase text-espresso-mid no-underline hover:text-primary transition-colors">
            {isPt ? "Método" : "Method"}
          </a>
          <a href="#services" className="text-xs tracking-widest uppercase text-espresso-mid no-underline hover:text-primary transition-colors">
            {isPt ? "Serviços" : "Services"}
          </a>
          <a href="#results" className="text-xs tracking-widest uppercase text-espresso-mid no-underline hover:text-primary transition-colors">
            {isPt ? "Resultados" : "Results"}
          </a>
          <a href="#about" className="text-xs tracking-widest uppercase text-espresso-mid no-underline hover:text-primary transition-colors">
            {isPt ? "Sobre" : "About"}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {user ? (
            <button onClick={() => navigate("/profile")} className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all">
              <Avatar className="h-8 w-8 border border-sand">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{getInitials()}</AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary text-primary-foreground px-5 py-2 text-xs tracking-widest uppercase font-medium hover:bg-terracotta-dark transition-all"
            >
              {isPt ? "Entrar" : "Sign In"}
            </button>
          )}
          {isAdmin && (
            <button onClick={() => navigate("/admin/dashboard")} className="p-2 hover:bg-sand/50 rounded transition-colors">
              <Sparkles className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 pt-20">
        <div className="flex flex-col justify-center px-4 md:px-16 py-16 md:py-24 relative z-10">
          <div className="animate-fade-up-1 flex items-center gap-3 text-xs tracking-widest uppercase text-primary mb-6">
            <span className="block w-8 h-px bg-primary" />
            {isPt ? "Nutrição & Treino Online" : "Online Nutrition & Training"}
          </div>

          <h1 className="animate-fade-up-2 font-serif text-[clamp(3rem,5vw,5.5rem)] font-light leading-[1.08] tracking-tight text-espresso mb-6">
            {isPt ? (
              <>O teu corpo,<br /><em className="italic text-primary font-light">a tua melhor</em><br />versão.</>
            ) : (
              <>Your body,<br /><em className="italic text-primary font-light">your best</em><br />version.</>
            )}
          </h1>

          <p className="animate-fade-up-3 text-base text-text-light max-w-md leading-relaxed mb-8">
            {isPt
              ? "Acompanhamento personalizado de nutrição e treino para quem quer resultados reais — sem dietas restritivas, sem treinos impossíveis."
              : "Personalized nutrition and training for those who want real results — no restrictive diets, no impossible workouts."}
          </p>

          <div className="animate-fade-up-4 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => openWhatsApp(WHATSAPP_MESSAGES.consultation, language)}
              className="btn-primary px-8 py-4"
            >
              {isPt ? "Começar Agora" : "Start Now"}
            </button>
            <button
              onClick={() => navigate("/learn")}
              className="text-xs tracking-widest uppercase text-espresso-mid font-medium flex items-center gap-2 hover:text-primary transition-colors"
            >
              {isPt ? "Ver Como Funciona" : "See How It Works"}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="animate-fade-up-5 flex gap-10 mt-12 pt-8 border-t border-sand flex-wrap">
            <div>
              <div className="font-serif text-4xl font-semibold text-espresso leading-none">200+</div>
              <div className="text-xs tracking-widest uppercase text-text-light mt-1">{isPt ? "Clientes Transformados" : "Clients Transformed"}</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-semibold text-espresso leading-none">4 {isPt ? "Anos" : "Years"}</div>
              <div className="text-xs tracking-widest uppercase text-text-light mt-1">{isPt ? "De Experiência" : "Of Experience"}</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-semibold text-espresso leading-none">98%</div>
              <div className="text-xs tracking-widest uppercase text-text-light mt-1">{isPt ? "Taxa de Satisfação" : "Satisfaction Rate"}</div>
            </div>
          </div>
        </div>

        {/* Hero right */}
        <div className="relative overflow-hidden bg-cream hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-sage/15 via-transparent to-sand" />
          <div
            className="absolute w-[480px] h-[580px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-morph-blob"
            style={{ background: "linear-gradient(145deg, hsl(20 52% 53% / 0.12), hsl(115 12% 57% / 0.18))", borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%" }}
          />
          <div className="absolute inset-12 rounded-[50%_50%_48%_52%/52%_48%_52%_48%] overflow-hidden border-2 border-primary/20 flex items-center justify-center">
            <img src={saraPortrait} alt="Sara Lucas - Nutricionista" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ── LEAD MAGNET STRIP ── */}
      <section className="bg-espresso px-4 md:px-16 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 flex-wrap">
        <div>
          <h3 className="font-serif text-2xl font-normal text-cream leading-snug">
            {isPt ? "Guia Gratuito: Come Bem, Treina Melhor" : "Free Guide: Eat Well, Train Better"}
          </h3>
          <p className="text-sm text-cream/75 mt-1">
            {isPt ? "7 dias de plano alimentar + rotina de treino. Totalmente grátis." : "7-day meal plan + training routine. Completely free."}
          </p>
        </div>
        <div>
          {leadMagnet.isSubmitted ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-sage-light flex-shrink-0" />
              <div>
                <p className="text-sm text-cream font-medium">
                  {isPt ? "Enviado! Verifica o teu email." : "Sent! Check your email."}
                </p>
                <p className="text-xs text-cream/65">
                  {isPt ? "Obrigado por te juntares à comunidade." : "Thanks for joining the community."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="email"
                  value={leadMagnet.email}
                  onChange={(e) => leadMagnet.setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && leadMagnet.submit()}
                  placeholder={isPt ? "O teu melhor email" : "Your best email"}
                  className="bg-white/[0.08] border border-white/15 text-white px-5 py-3 text-sm w-60 outline-none focus:border-primary placeholder:text-white/35 font-sans"
                />
                <button onClick={() => leadMagnet.submit()} disabled={leadMagnet.isSubmitting} className="bg-primary text-white border-none px-6 py-3 cursor-pointer text-xs tracking-widest uppercase font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50">
                  {leadMagnet.isSubmitting && <Loader2 className="h-3 w-3 animate-spin inline mr-1" />}
                  {isPt ? "Receber Grátis" : "Get Free"}
                </button>
              </div>
              {leadMagnet.error && <p className="text-xs text-red-400 mt-1">{leadMagnet.error}</p>}
              <p className="text-[0.65rem] tracking-widest uppercase text-sage-light mt-2">
                ✓ {isPt ? "Sem spam. Cancelar a qualquer momento." : "No spam. Cancel anytime."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── METHOD ── */}
      <section id="method" className="bg-cream px-4 md:px-16 py-20 md:py-24">
        <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-primary mb-4">
          <span className="block w-6 h-px bg-primary" />
          {isPt ? "O Meu Método" : "My Method"}
        </div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-espresso mb-12">
          {isPt ? (
            <>Uma abordagem que <em className="italic text-primary">funciona</em></>
          ) : (
            <>An approach that <em className="italic text-primary">works</em></>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          <div className="flex flex-col">
            {[
              { num: "01", title: isPt ? "Avaliação Inicial" : "Initial Assessment", desc: isPt ? "Percebemos os teus objetivos, historial, rotina e preferências alimentares. Não existe um plano igual para duas pessoas." : "We understand your goals, history, routine and food preferences. No two plans are alike." },
              { num: "02", title: isPt ? "Plano Personalizado" : "Personalized Plan", desc: isPt ? "Criamos um plano alimentar e de treino adaptado à tua vida real — horários, gostos e nível de condicionamento." : "We create a meal and training plan adapted to your real life — schedules, tastes and fitness level." },
              { num: "03", title: isPt ? "Acompanhamento Contínuo" : "Continuous Support", desc: isPt ? "Check-ins semanais, ajustes ao plano e suporte direto por mensagem. Nunca estás sozinho no processo." : "Weekly check-ins, plan adjustments and direct message support. You're never alone." },
              { num: "04", title: isPt ? "Resultados Sustentáveis" : "Sustainable Results", desc: isPt ? "O objetivo não é a dieta de 4 semanas. É criar hábitos que duram para a vida inteira." : "The goal isn't a 4-week diet. It's building habits that last a lifetime." },
            ].map((step) => (
              <div key={step.num} className="grid grid-cols-[48px_1fr] gap-5 py-6 border-b border-sand last:border-b-0 group cursor-default">
                <span className="font-serif text-4xl font-semibold text-sand leading-none group-hover:text-primary transition-colors">{step.num}</span>
                <div>
                  <h4 className="font-serif text-xl font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-text-light leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block relative aspect-[3/4] rounded overflow-hidden bg-gradient-to-br from-sage-light to-sand">
            <div className="absolute bottom-[-20px] right-[-20px] w-36 h-36 rounded-full bg-primary/15" />
          </div>
        </div>
      </section>

      {/* ── SERVICES / PRICING ── */}
      <section id="services" className="bg-warm-white px-4 md:px-16 py-20 md:py-24">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-primary mb-4">
            <span className="block w-6 h-px bg-primary" />
            {isPt ? "Serviços" : "Services"}
          </div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-espresso mb-2">
            {isPt ? (
              <>Escolhe o teu <em className="italic text-primary">plano</em></>
            ) : (
              <>Choose your <em className="italic text-primary">plan</em></>
            )}
          </h2>
          <p className="text-text-light mt-3">
            {isPt ? "Três opções para diferentes necessidades e orçamentos. Sem surpresas, sem letras pequenas." : "Three options for different needs and budgets. No surprises, no fine print."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Essential */}
          <div className="border border-sand rounded p-8 bg-warm-white hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="text-xs tracking-widest uppercase text-primary mb-3">{isPt ? "Essencial" : "Essential"}</div>
            <h3 className="font-serif text-2xl font-semibold mb-1">{isPt ? "Plano Base" : "Base Plan"}</h3>
            <p className="text-sm text-text-light mb-6 leading-relaxed">{isPt ? "Para quem quer começar com o plano alimentar e fazer a sua própria gestão." : "For those who want to start with the meal plan and manage on their own."}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-serif text-5xl font-semibold">€79</span>
              <span className="text-sm text-text-light">/{isPt ? "mês" : "mo"}</span>
            </div>
            <ul className="flex flex-col gap-2 mb-8 list-none">
              {(isPt ? ["Plano alimentar personalizado", "Lista de compras semanal", "Acesso à biblioteca de receitas", "Revisão mensal do plano", "Suporte por email"] : ["Personalized meal plan", "Weekly shopping list", "Recipe library access", "Monthly plan review", "Email support"]).map((f, i) => (
                <li key={i} className="text-sm flex items-start gap-2"><span className="text-secondary font-medium flex-shrink-0 mt-px">✓</span> {f}</li>
              ))}
            </ul>
            <button onClick={() => openWhatsApp(WHATSAPP_MESSAGES.essentialPlan, language)} className="block w-full text-center py-3 border border-sand text-espresso text-xs tracking-widest uppercase font-medium hover:border-primary hover:text-primary transition-all">
              {isPt ? "Começar" : "Start"}
            </button>
          </div>

          {/* Complete - Featured */}
          <div className="bg-espresso border border-espresso rounded p-8 relative hover:-translate-y-1 hover:shadow-xl transition-all text-cream">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[0.65rem] tracking-widest uppercase px-4 py-1 rounded-full whitespace-nowrap">{isPt ? "Mais Popular" : "Most Popular"}</span>
            <div className="text-xs tracking-widest uppercase text-sage-light mb-3">{isPt ? "Completo" : "Complete"}</div>
            <h3 className="font-serif text-2xl font-semibold mb-1 text-cream">{isPt ? "Nutrição + Treino" : "Nutrition + Training"}</h3>
            <p className="text-sm text-cream/70 mb-6 leading-relaxed">{isPt ? "O programa mais completo para transformação física e mudança de hábitos." : "The most complete program for physical transformation and habit change."}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-serif text-5xl font-semibold text-cream">€149</span>
              <span className="text-sm text-cream/65">/{isPt ? "mês" : "mo"}</span>
            </div>
            <ul className="flex flex-col gap-2 mb-8 list-none">
              {(isPt ? ["Plano alimentar personalizado", "Plano de treino (ginásio ou casa)", "Check-in semanal por videochamada", "Suporte diário por WhatsApp", "Ajustes ilimitados ao plano", "Acesso a receitas e guias"] : ["Personalized meal plan", "Training plan (gym or home)", "Weekly video check-in", "Daily WhatsApp support", "Unlimited plan adjustments", "Access to recipes and guides"]).map((f, i) => (
                <li key={i} className="text-sm flex items-start gap-2 text-cream/80"><span className="text-sage-light font-medium flex-shrink-0 mt-px">✓</span> {f}</li>
              ))}
            </ul>
            <button onClick={() => openWhatsApp(WHATSAPP_MESSAGES.completePlan, language)} className="block w-full text-center py-3 bg-primary text-white border border-primary text-xs tracking-widest uppercase font-medium hover:bg-terracotta-dark hover:shadow-lg transition-all">
              {isPt ? "Começar Agora" : "Start Now"}
            </button>
          </div>

          {/* Premium */}
          <div className="border border-sand rounded p-8 bg-warm-white hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className="text-xs tracking-widest uppercase text-primary mb-3">Premium</div>
            <h3 className="font-serif text-2xl font-semibold mb-1">VIP 1:1</h3>
            <p className="text-sm text-text-light mb-6 leading-relaxed">{isPt ? "Acompanhamento exclusivo com sessões individuais e prioridade total." : "Exclusive coaching with individual sessions and total priority."}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-serif text-5xl font-semibold">€249</span>
              <span className="text-sm text-text-light">/{isPt ? "mês" : "mo"}</span>
            </div>
            <ul className="flex flex-col gap-2 mb-8 list-none">
              {(isPt ? ["Tudo do plano Completo", "2 sessões mensais por videochamada", "Análise de composição corporal", "Plano de suplementação", "Resposta garantida em 2h", "Acesso vitalício a recursos"] : ["Everything in Complete", "2 monthly video sessions", "Body composition analysis", "Supplementation plan", "Guaranteed 2h response", "Lifetime resource access"]).map((f, i) => (
                <li key={i} className="text-sm flex items-start gap-2"><span className="text-secondary font-medium flex-shrink-0 mt-px">✓</span> {f}</li>
              ))}
            </ul>
            <button onClick={() => openWhatsApp(WHATSAPP_MESSAGES.vipPlan, language)} className="block w-full text-center py-3 border border-sand text-espresso text-xs tracking-widest uppercase font-medium hover:border-primary hover:text-primary transition-all">
              {isPt ? "Começar" : "Start"}
            </button>
          </div>
        </div>
      </section>

      {/* ── RESULTS / TESTIMONIALS ── */}
      <section id="results" className="bg-cream px-4 md:px-16 py-20 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-primary mb-4">
              <span className="block w-6 h-px bg-primary" />
              {isPt ? "Resultados Reais" : "Real Results"}
            </div>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-espresso">
              {isPt ? (
                <>O que dizem os meus <em className="italic text-primary">clientes</em></>
              ) : (
                <>What my <em className="italic text-primary">clients</em> say</>
              )}
            </h2>
          </div>
        </div>
        <TestimonialsSection location="homepage" />
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="bg-warm-white px-4 md:px-16 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="aspect-[3/4] rounded overflow-hidden bg-gradient-to-br from-sand to-cream relative hidden md:block">
            <img src={saraPortrait} alt="Sara Lucas" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-primary mb-4">
              <span className="block w-6 h-px bg-primary" />
              {isPt ? "Sobre Mim" : "About Me"}
            </div>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-espresso mb-6">
              {isPt ? (<>Olá, sou a <em className="italic text-primary">Sara</em></>) : (<>Hi, I'm <em className="italic text-primary">Sara</em></>)}
            </h2>
            <p className="font-serif text-xl italic text-espresso leading-relaxed mb-6">
              {isPt
                ? '"Acredito que cada pessoa merece um plano feito à sua medida — não uma dieta copiada de alguém."'
                : '"I believe every person deserves a plan made for them — not a diet copied from someone else."'}
            </p>
            <p className="text-text-light leading-relaxed mb-4">
              {isPt
                ? "Sou nutricionista e personal trainer com formação em ciências do desporto e nutrição clínica. Nos últimos 4 anos, acompanhei mais de 200 pessoas a transformar o seu corpo e a sua saúde — de forma sustentável, sem extremos."
                : "I'm a nutritionist and personal trainer with a background in sports science and clinical nutrition. Over the past 4 years, I've helped over 200 people transform their body and health — sustainably, without extremes."}
            </p>
            <p className="text-text-light leading-relaxed mb-8">
              {isPt
                ? "A minha abordagem combina ciência com praticidade. Sei que tens uma vida ocupada, por isso crio planos que cabem na tua rotina — não o contrário."
                : "My approach combines science with practicality. I know you have a busy life, so I create plans that fit your routine — not the other way around."}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {(isPt ? ["Nutricionista Certificada", "Personal Trainer NSCA", "Pós-graduação Nutrição Desportiva", "Membro da Ordem dos Nutricionistas"] : ["Certified Nutritionist", "NSCA Personal Trainer", "Sports Nutrition Postgrad", "Nutritionists Board Member"]).map((tag, i) => (
                <span key={i} className="text-xs tracking-widest uppercase px-3 py-1 border border-sand rounded-full text-espresso-mid">{tag}</span>
              ))}
            </div>
            <button onClick={() => openWhatsApp(WHATSAPP_MESSAGES.workWithMe, language)} className="btn-primary px-8 py-3">
              {isPt ? "Trabalhar Comigo" : "Work With Me"}
            </button>
          </div>
        </div>
      </section>

      {/* ── DIGITAL PRODUCTS ── */}
      <section className="bg-cream px-4 md:px-16 py-20 md:py-24">
        <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-primary mb-4">
          <span className="block w-6 h-px bg-primary" />
          {isPt ? "Produtos Digitais" : "Digital Products"}
        </div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-espresso mb-12">
          {isPt ? (
            <>Recursos para aprender e <em className="italic text-primary">evoluir</em></>
          ) : (
            <>Resources to learn and <em className="italic text-primary">grow</em></>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: "📖", tag: "Ebook", title: isPt ? "Guia de Nutrição para Iniciantes" : "Nutrition Guide for Beginners", desc: isPt ? "Tudo o que precisas saber sobre macronutrientes, refeições e hábitos saudáveis. 80 páginas práticas." : "Everything you need to know about macronutrients, meals and healthy habits. 80 practical pages.", price: "€19", bg: "from-primary/10 to-primary/20" },
            { emoji: "🏋️", tag: isPt ? "Programa" : "Program", title: isPt ? "Treino em Casa — 8 Semanas" : "Home Training — 8 Weeks", desc: isPt ? "Programa completo de treino sem equipamento. 3 sessões por semana, progressivo e adaptável." : "Complete no-equipment training program. 3 sessions per week, progressive and adaptable.", price: "€37", bg: "from-secondary/10 to-secondary/20" },
            { emoji: "🍽️", tag: "Templates", title: isPt ? "Pack de 30 Receitas Proteicas" : "30 Protein Recipes Pack", desc: isPt ? "30 receitas ricas em proteína, rápidas de preparar e deliciosas. Com valores nutricionais detalhados." : "30 protein-rich recipes, quick to prepare and delicious. With detailed nutritional values.", price: "€12", bg: "from-espresso/5 to-primary/10" },
          ].map((product) => (
            <div key={product.title} className="bg-warm-white border border-sand rounded overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className={`h-44 flex items-center justify-center bg-gradient-to-br ${product.bg}`}>
                <span className="text-5xl opacity-50">{product.emoji}</span>
              </div>
              <div className="p-6">
                <div className="text-[0.65rem] tracking-widest uppercase text-primary mb-2">{product.tag}</div>
                <h3 className="font-serif text-lg font-semibold mb-2">{product.title}</h3>
                <p className="text-sm text-text-light leading-relaxed mb-4">{product.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-semibold">{product.price}</span>
                  <button onClick={() => {
                      const match = storeItems?.find(item =>
                        item.name_pt?.toLowerCase().includes(product.title.toLowerCase().split("—")[0].trim().toLowerCase()) ||
                        item.name_en?.toLowerCase().includes(product.title.toLowerCase().split("—")[0].trim().toLowerCase())
                      );
                      if (match) { checkout(match.id, "store_item"); } else { navigate("/learn?type=store"); }
                    }}
                    disabled={checkoutLoading}
                    className="text-xs tracking-widest uppercase text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all disabled:opacity-50"
                  >
                    {isPt ? "Comprar" : "Buy"} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOOKING CTA ── */}
      <section className="bg-espresso text-center px-4 md:px-16 py-20 md:py-28">
        <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-sage-light mb-4 justify-center">
          <span className="block w-6 h-px bg-sage-light" />
          {isPt ? "Próximo Passo" : "Next Step"}
        </div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight text-cream mb-4">
          {isPt ? (
            <>Pronto para a tua <em className="italic text-primary">transformação</em>?</>
          ) : (
            <>Ready for your <em className="italic text-primary">transformation</em>?</>
          )}
        </h2>
        <p className="text-cream/70 max-w-lg mx-auto mb-8">
          {isPt ? "Marca uma consulta gratuita de 20 minutos. Sem compromisso — só para perceber se somos um bom match." : "Book a free 20-minute consultation. No commitment — just to see if we're a good match."}
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={() => openWhatsApp(WHATSAPP_MESSAGES.freeConsultation, language)} className="bg-cream text-espresso px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-white hover:-translate-y-1 hover:shadow-xl transition-all">
            {isPt ? "Marcar Consulta Gratuita" : "Book Free Consultation"}
          </button>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="border border-cream/25 text-cream px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-cream/[0.08] hover:border-cream/40 transition-all no-underline flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            {isPt ? "Seguir no Instagram" : "Follow on Instagram"}
          </a>
        </div>
        <p className="mt-8 text-xs tracking-widest text-cream/50 uppercase">
          ✓ {isPt ? "Consulta gratuita" : "Free consultation"}  ·  ✓ {isPt ? "Sem compromisso" : "No commitment"}  ·  ✓ {isPt ? "Resposta em 24h" : "Response in 24h"}
        </p>
      </section>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
