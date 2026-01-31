import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsContent } from "@/hooks/useCmsContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const CATEGORIES = [
  { value: "app_issues", labelPt: "Problemas com a App", labelEn: "App Issues" },
  { value: "courses", labelPt: "Cursos / Academy", labelEn: "Courses / Academy" },
  { value: "payments", labelPt: "Pagamentos", labelEn: "Payments" },
  { value: "other", labelPt: "Outro", labelEn: "Other" },
];

// Validation schema
const supportSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().trim().min(10, "Message too short").max(2000, "Message too long"),
});

export default function Support() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const cms = useCmsContent();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = supportSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("support_messages").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        category: formData.category,
        message: formData.message.trim(),
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success(
        t({
          pt: "Mensagem enviada com sucesso!",
          en: "Message sent successfully!",
        })
      );
    } catch (error) {
      console.error("Error submitting support message:", error);
      toast.error(
        t({
          pt: "Erro ao enviar mensagem. Tenta novamente.",
          en: "Error sending message. Please try again.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewMessage = () => {
    setFormData({ name: "", email: "", category: "", message: "" });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/tools")}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            {cms.get("support.title", { pt: "Ajuda & Suporte", en: "Help & Support" })}
          </h1>
        </div>

        {/* Success State */}
        <div className="result-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            {cms.get("support.success.title", { pt: "Mensagem Enviada!", en: "Message Sent!" })}
          </h2>
          <p className="text-sm text-white/70 mb-6">
            {cms.get("support.success.message", {
              pt: "Obrigado pelo contacto. Responderemos o mais breve possível.",
              en: "Thank you for reaching out. We'll respond as soon as possible.",
            })}
          </p>
          <button onClick={handleNewMessage} className="btn-secondary px-6 py-2">
            {cms.get("support.success.newMessage", { pt: "Enviar outra mensagem", en: "Send another message" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/tools")}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {cms.get("support.title", { pt: "Ajuda & Suporte", en: "Help & Support" })}
          </h1>
          <p className="text-xs text-white/60">
            {cms.get("support.subtitle", { pt: "Estamos aqui para ajudar", en: "We're here to help" })}
          </p>
        </div>
      </div>

      {/* Intro Card */}
      <div className="result-card p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-white/80">
              {cms.get("support.intro", {
                pt: "Usa este formulário para questões sobre a app, cursos, pagamentos ou qualquer dúvida técnica.",
                en: "Use this form for questions about the app, courses, payments, or any technical questions.",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Consultation Note */}
      <div className="result-card p-4 mb-6 border border-secondary/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-white/80">
            {cms.get("support.consultationNote", {
              pt: "Para consultas com nutricionista, utiliza a opção 'Marcar Consulta' no botão flutuante.",
              en: "For nutritionist consultations, use the 'Book Consultation' option in the floating button.",
            })}
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {cms.get("support.form.name", { pt: "Nome", en: "Name" })}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={t({ pt: "O teu nome", en: "Your name" })}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
              errors.name ? "border-destructive" : "border-white/10"
            } text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {cms.get("support.form.email", { pt: "Email", en: "Email" })}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder={t({ pt: "teu@email.com", en: "your@email.com" })}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
              errors.email ? "border-destructive" : "border-white/10"
            } text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50`}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {cms.get("support.form.category", { pt: "Categoria", en: "Category" })}
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
              errors.category ? "border-destructive" : "border-white/10"
            } text-white focus:outline-none focus:border-primary/50 appearance-none`}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23ffffff50\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="" className="bg-background text-white/60">
              {t({ pt: "Seleciona uma categoria", en: "Select a category" })}
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-background text-white">
                {language === "pt" ? cat.labelPt : cat.labelEn}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {cms.get("support.form.message", { pt: "Mensagem", en: "Message" })}
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder={t({ pt: "Descreve a tua questão...", en: "Describe your question..." })}
            rows={5}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
              errors.message ? "border-destructive" : "border-white/10"
            } text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 resize-none`}
          />
          {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t({ pt: "A enviar...", en: "Sending..." })}
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              {cms.get("support.form.submit", { pt: "Enviar Mensagem", en: "Send Message" })}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
