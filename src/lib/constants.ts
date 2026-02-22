// ─────────────────────────────────────────────
//  Sara Lucas Academy — Shared Constants
//  Single source of truth for all contact info,
//  keys, and config used across the app.
// ─────────────────────────────────────────────

export const WHATSAPP_NUMBER = "351939535077";
export const INSTAGRAM_URL = "https://www.instagram.com/saralucas_pt_nutricionista/";

export const WHATSAPP_MESSAGES = {
  consultation: {
    pt: "Olá! Gostaria de agendar uma consulta.",
    en: "Hi! I'd like to book a consultation.",
  },
  freeConsultation: {
    pt: "Olá, gostaria de agendar uma consulta gratuita.",
    en: "Hi, I'd like to book a free consultation.",
  },
  appUser: {
    pt: "Olá! Sou utilizador da app Sara Lucas e tenho interesse em agendar uma consulta.",
    en: "Hi! I'm a Sara Lucas app user and I'd like to book a nutrition consultation.",
  },
  essentialPlan: {
    pt: "Olá, quero saber mais sobre o Plano Essencial.",
    en: "Hi, I want to know more about the Essential Plan.",
  },
  completePlan: {
    pt: "Olá, quero saber mais sobre o Plano Completo.",
    en: "Hi, I want to know more about the Complete Plan.",
  },
  vipPlan: {
    pt: "Olá, quero saber mais sobre o Plano VIP.",
    en: "Hi, I want to know more about the VIP Plan.",
  },
  workWithMe: {
    pt: "Olá, gostaria de trabalhar contigo!",
    en: "Hi, I'd like to work with you!",
  },
  calorieGoalUpsell: {
    pt: "Olá! Estou a usar a app e gostaria de um plano alimentar personalizado.",
    en: "Hi! I'm using the app and I'd like a personalized meal plan.",
  },
} as const;

export function openWhatsApp(message: { pt: string; en: string }, language: "pt" | "en" = "pt") {
  const text = encodeURIComponent(message[language]);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
}

// Local storage / session storage keys
export const STORAGE_KEYS = {
  onboardingCompleted: "sara-lucas-onboarding-completed",
  oauthSkipEntryFlow: "sara-lucas-oauth-skip-entry-flow",
  sessionEntryFlowDone: "sara-lucas-entry-flow-done",
  nutritionistTooltipShown: "saralucas_nutritionist_tooltip_shown",
  onboardingSession: "saralucas_onboarding_session",
  calorieGoal: "saralucas_daily_goal",
  calorieGoalPromptShown: "saralucas_calorie_goal_prompt_shown",
  leadMagnetSubmitted: "saralucas_lead_magnet_submitted",
} as const;
