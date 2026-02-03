import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react";
import { useAuthDebugEvents } from "@/hooks/useAuthDebugEvents";
import { useLanguage } from "@/hooks/useLanguage";

export default function AdminAuthLogs() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data, isLoading, isFetching, refetch, error } = useAuthDebugEvents(60);

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t({ pt: "Logs de Autenticação", en: "Auth Logs" })}
            </h1>
            <p className="text-xs text-white/60">
              {t({
                pt: "Eventos de OAuth (Google/Apple) em tempo real",
                en: "OAuth events (Google/Apple) in near real-time",
              })}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Refresh"
          title={t({ pt: "Atualizar", en: "Refresh" })}
        >
          <RefreshCw className={`h-5 w-5 text-white/70 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error ? (
        <div className="result-card p-4 border border-destructive/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-destructive/20 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-destructive">
                {t({ pt: "Erro a carregar logs", en: "Failed to load logs" })}
              </p>
              <p className="text-sm text-white/70">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="text-sm text-white/60">{t({ pt: "A carregar...", en: "Loading..." })}</div>
      ) : !data || data.length === 0 ? (
        <div className="text-sm text-white/60">
          {t({ pt: "Sem eventos ainda. Faz um login para gerar logs.", en: "No events yet. Trigger a login to generate logs." })}
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((e) => (
            <div key={e.id} className="result-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {e.stage}
                    {e.provider ? <span className="text-white/50"> · {e.provider}</span> : null}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(e.created_at).toLocaleString(language === "pt" ? "pt-PT" : "en-GB")}
                  </p>
                </div>
              </div>

              {e.error_message ? (
                <p className="mt-2 text-sm text-destructive">{e.error_message}</p>
              ) : null}

              {e.url ? (
                <p className="mt-2 text-xs text-white/50 break-all">{e.url}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/70">
          {t({
            pt: "Dica: se um utilizador não consegue abrir a consola no Safari, estes logs ajudam a ver em que etapa o OAuth falhou.",
            en: "Tip: if users can't open the Safari console, these logs help identify which OAuth step failed.",
          })}
        </p>
      </div>
    </div>
  );
}
