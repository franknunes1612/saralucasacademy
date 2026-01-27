import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Heart, Send } from "lucide-react";

export default function GiftPlan() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Gift a Plan</h1>
      </div>

      {/* Hero */}
      <div className="result-card p-8 mb-6 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-warning to-warning/60 flex items-center justify-center">
          <Gift className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-3">
          Give the Gift of Health
        </h2>
        <p className="text-sm text-white/70 max-w-xs mx-auto mb-6">
          Send a personalized nutrition plan to someone you care about. 
          They'll receive a custom AI-generated plan tailored to their goals.
        </p>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80">Gift Plan</span>
            <span className="text-lg font-bold text-white">€24.99</span>
          </div>
          <p className="text-xs text-white/50 text-left">
            Includes personalized nutrition targets, macro goals, and meal guidance.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-white/5">
            <div className="p-2 rounded-lg bg-success/20">
              <Heart className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Thoughtful & Personal</p>
              <p className="text-xs text-white/50">They customize it to their own goals</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-white/5">
            <div className="p-2 rounded-lg bg-primary/20">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Easy to Send</p>
              <p className="text-xs text-white/50">Delivered via email with a personal message</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => {/* Handle gift purchase */}}
        className="w-full py-4 btn-primary rounded-xl font-semibold text-lg"
      >
        Send a Gift – €24.99
      </button>

      <p className="text-xs text-white/40 text-center mt-4">
        Gift codes are valid for 6 months. Non-refundable.
      </p>
    </div>
  );
}
