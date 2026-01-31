import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, CreditCard, Heart, AlertCircle, Scale } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";

export default function TermsOfUse() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const cms = useCmsContent();

  const sections = [
    {
      icon: FileText,
      titleKey: "terms.section1.title",
      contentKey: "terms.section1.content",
      defaultTitle: { pt: "Utilização da Aplicação", en: "Application Usage" },
      defaultContent: {
        pt: "A Sara Lucas Academy é uma plataforma educativa dedicada à nutrição e bem-estar. Ao utilizar esta aplicação, concorda em usar os nossos serviços de forma responsável e ética. O conteúdo disponibilizado destina-se exclusivamente a fins educativos e informativos.",
        en: "Sara Lucas Academy is an educational platform dedicated to nutrition and wellness. By using this application, you agree to use our services responsibly and ethically. The content provided is intended exclusively for educational and informational purposes."
      }
    },
    {
      icon: Heart,
      titleKey: "terms.section2.title",
      contentKey: "terms.section2.content",
      defaultTitle: { pt: "Aviso Educativo", en: "Educational Disclaimer" },
      defaultContent: {
        pt: "Todo o conteúdo apresentado nesta aplicação, incluindo cursos, programas e ebooks, é de natureza educativa e não substitui o aconselhamento profissional de saúde. As informações fornecidas são baseadas em conhecimento geral de nutrição e não devem ser consideradas como diagnóstico ou tratamento médico.",
        en: "All content presented in this application, including courses, programs and ebooks, is of an educational nature and does not replace professional health advice. The information provided is based on general nutrition knowledge and should not be considered as medical diagnosis or treatment."
      }
    },
    {
      icon: AlertCircle,
      titleKey: "terms.section3.title",
      contentKey: "terms.section3.content",
      defaultTitle: { pt: "Isenção de Responsabilidade Médica", en: "Medical Liability Disclaimer" },
      defaultContent: {
        pt: "A Sara Lucas Academy e os seus criadores não assumem qualquer responsabilidade por problemas de saúde que possam surgir da aplicação das informações contidas nos nossos conteúdos. Recomendamos vivamente que consulte um profissional de saúde qualificado antes de iniciar qualquer programa alimentar ou de exercício físico.",
        en: "Sara Lucas Academy and its creators assume no responsibility for health problems that may arise from the application of information contained in our content. We strongly recommend that you consult a qualified healthcare professional before starting any dietary or exercise program."
      }
    },
    {
      icon: Shield,
      titleKey: "terms.section4.title",
      contentKey: "terms.section4.content",
      defaultTitle: { pt: "Conteúdo Pago", en: "Paid Content" },
      defaultContent: {
        pt: "A nossa plataforma oferece cursos, programas de transformação, ebooks e bundles para compra. Ao adquirir qualquer produto digital, receberá acesso vitalício ao conteúdo adquirido. Os preços apresentados são finais e incluem todos os impostos aplicáveis.",
        en: "Our platform offers courses, transformation programs, ebooks and bundles for purchase. When purchasing any digital product, you will receive lifetime access to the purchased content. The prices shown are final and include all applicable taxes."
      }
    },
    {
      icon: CreditCard,
      titleKey: "terms.section5.title",
      contentKey: "terms.section5.content",
      defaultTitle: { pt: "Pagamentos e Reembolsos", en: "Payments and Refunds" },
      defaultContent: {
        pt: "Os pagamentos são processados de forma segura através do Stripe. Devido à natureza digital dos nossos produtos, não oferecemos reembolsos após o acesso ao conteúdo ter sido concedido, exceto nos casos previstos pela lei do consumidor. Caso tenha algum problema com a sua compra, contacte-nos através do nosso suporte.",
        en: "Payments are processed securely through Stripe. Due to the digital nature of our products, we do not offer refunds after access to the content has been granted, except in cases provided by consumer law. If you have any problems with your purchase, please contact us through our support."
      }
    },
    {
      icon: Scale,
      titleKey: "terms.section6.title",
      contentKey: "terms.section6.content",
      defaultTitle: { pt: "Propriedade Intelectual", en: "Intellectual Property" },
      defaultContent: {
        pt: "Todo o conteúdo disponibilizado na Sara Lucas Academy, incluindo textos, vídeos, imagens e materiais de curso, é propriedade intelectual protegida. É proibida a reprodução, distribuição ou partilha não autorizada de qualquer conteúdo sem consentimento prévio por escrito.",
        en: "All content made available on Sara Lucas Academy, including texts, videos, images and course materials, is protected intellectual property. Reproduction, distribution or unauthorized sharing of any content without prior written consent is prohibited."
      }
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {cms.get("terms.pageTitle") || t({ pt: "Termos de Uso", en: "Terms of Use" })}
        </h1>
      </div>

      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="result-card p-5 mb-6"
      >
        <p className="text-sm text-white/70 leading-relaxed">
          {cms.get("terms.intro") || t({
            pt: "Bem-vindo à Sara Lucas Academy. Por favor, leia atentamente estes termos de uso antes de utilizar a nossa aplicação. Ao aceder ou utilizar os nossos serviços, concorda com estes termos.",
            en: "Welcome to Sara Lucas Academy. Please read these terms of use carefully before using our application. By accessing or using our services, you agree to these terms."
          })}
        </p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.titleKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="result-card p-5"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/20 shrink-0">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-white mb-2">
                  {cms.get(section.titleKey) || t(section.defaultTitle)}
                </h2>
                <p className="text-sm text-white/70 leading-relaxed">
                  {cms.get(section.contentKey) || t(section.defaultContent)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-white/40">
          {cms.get("terms.lastUpdated") || t({
            pt: "Última atualização: Janeiro 2026",
            en: "Last updated: January 2026"
          })}
        </p>
        <p className="text-xs text-white/30 mt-1">
          Sara Lucas Academy © 2026
        </p>
      </motion.div>
    </div>
  );
}
