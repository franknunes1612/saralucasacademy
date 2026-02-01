import { useState, useEffect } from "react";
import { Droplets, Plus, Minus, RotateCcw, Settings, Bell, BellOff } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useWaterReminders } from "@/hooks/useWaterReminders";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "sara-lucas-water-tracker";
const DEFAULT_GOAL_ML = 2000; // 2 liters
const CUP_SIZE_ML = 250; // 250ml per cup

const GOAL_OPTIONS = [
  { ml: 1500, label: "1.5L" },
  { ml: 2000, label: "2L" },
  { ml: 2500, label: "2.5L" },
  { ml: 3000, label: "3L" },
  { ml: 3500, label: "3.5L" },
];

const INTERVAL_OPTIONS = [
  { minutes: 60, label: { pt: "1 hora", en: "1 hour" } },
  { minutes: 90, label: { pt: "1.5 horas", en: "1.5 hours" } },
  { minutes: 120, label: { pt: "2 horas", en: "2 hours" } },
  { minutes: 180, label: { pt: "3 horas", en: "3 hours" } },
];

interface WaterData {
  date: string;
  consumed: number; // in ml
  goal: number; // in ml
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function loadWaterData(): WaterData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: WaterData = JSON.parse(stored);
      if (data.date !== getTodayKey()) {
        return { date: getTodayKey(), consumed: 0, goal: data.goal || DEFAULT_GOAL_ML };
      }
      return data;
    }
  } catch (e) {
    console.error("Failed to load water data:", e);
  }
  return { date: getTodayKey(), consumed: 0, goal: DEFAULT_GOAL_ML };
}

function saveWaterData(data: WaterData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save water data:", e);
  }
}

interface WaterGlassProps {
  filled: boolean;
  index: number;
  justFilled?: boolean;
}

function WaterGlass({ filled, index, justFilled }: WaterGlassProps) {
  return (
    <div
      className={`
        relative w-8 h-10 rounded-b-lg border-2 transition-all duration-300
        ${filled 
          ? "border-secondary bg-secondary/20" 
          : "border-white/40 bg-white/10"
        }
        ${justFilled ? "animate-bounce" : ""}
      `}
      style={{ 
        animationDelay: `${index * 50}ms`,
        transitionDelay: `${index * 30}ms`
      }}
    >
      {/* Glass handle */}
      <div 
        className={`
          absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-4 
          rounded-r-full border-2 border-l-0
          ${filled ? "border-secondary" : "border-white/40"}
        `}
      />
      
      {/* Water fill */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 rounded-b-md
          bg-gradient-to-t from-secondary to-secondary/70
          transition-all duration-500 ease-out
          ${filled ? "h-[85%] opacity-100" : "h-0 opacity-0"}
        `}
        style={{ transitionDelay: `${index * 30}ms` }}
      >
        {/* Water wave effect */}
        {filled && (
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
            <div 
              className="w-[200%] h-2 bg-white/30 rounded-full animate-pulse"
              style={{ 
                animation: "wave 2s ease-in-out infinite",
                animationDelay: `${index * 100}ms`
              }}
            />
          </div>
        )}
      </div>
      
      {/* Bubbles when filled */}
      {filled && (
        <>
          <div 
            className="absolute bottom-2 left-1 w-1 h-1 bg-white/40 rounded-full animate-ping"
            style={{ animationDuration: "2s", animationDelay: `${index * 200}ms` }}
          />
          <div 
            className="absolute bottom-3 right-1.5 w-0.5 h-0.5 bg-white/30 rounded-full animate-ping"
            style={{ animationDuration: "2.5s", animationDelay: `${index * 150 + 100}ms` }}
          />
        </>
      )}
    </div>
  );
}

export function WaterTracker() {
  const { t } = useLanguage();
  const [data, setData] = useState<WaterData>(loadWaterData);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const {
    settings: reminderSettings,
    updateSettings: updateReminderSettings,
    permissionStatus,
    enableReminders,
    disableReminders,
    isSupported: remindersSupported,
  } = useWaterReminders();

  useEffect(() => {
    saveWaterData(data);
  }, [data]);

  const cupsConsumed = Math.floor(data.consumed / CUP_SIZE_ML);
  const cupsGoal = Math.floor(data.goal / CUP_SIZE_ML);
  const isGoalReached = data.consumed >= data.goal;

  useEffect(() => {
    if (isGoalReached && cupsConsumed === cupsGoal) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isGoalReached, cupsConsumed, cupsGoal]);

  const addCup = () => {
    if (cupsConsumed < cupsGoal) {
      setLastAdded(cupsConsumed);
      setData((prev) => ({
        ...prev,
        consumed: prev.consumed + CUP_SIZE_ML,
      }));
      setTimeout(() => setLastAdded(null), 600);
    }
  };

  const removeCup = () => {
    setData((prev) => ({
      ...prev,
      consumed: Math.max(0, prev.consumed - CUP_SIZE_ML),
    }));
  };

  const resetToday = () => {
    setData((prev) => ({
      ...prev,
      consumed: 0,
    }));
    setShowCelebration(false);
  };

  const setGoal = (newGoal: number) => {
    setData((prev) => ({
      ...prev,
      goal: newGoal,
      // Keep consumed but cap it to new goal display
    }));
  };

  // Create array of glasses
  const glasses = Array.from({ length: cupsGoal }, (_, i) => ({
    filled: i < cupsConsumed,
    justFilled: lastAdded === i,
  }));

  return (
    <div className="result-card p-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary/20 text-secondary">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {t({ pt: "Hidratação", en: "Hydration" })}
            </h3>
            <p className="text-xs text-white/60">
              {t({ pt: `Meta: ${data.goal / 1000}L`, en: `Goal: ${data.goal / 1000}L` })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={t({ pt: "Definições", en: "Settings" })}
              >
                <Settings className="h-4 w-4 text-white/70" />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-3 bg-card border-white/10" 
              align="end"
            >
              {/* Daily Goal */}
              <div className="mb-4">
                <p className="text-xs text-white/60 mb-2 font-medium">
                  {t({ pt: "Meta diária", en: "Daily goal" })}
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {GOAL_OPTIONS.map((option) => (
                    <button
                      key={option.ml}
                      onClick={() => setGoal(option.ml)}
                      className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        data.goal === option.ml
                          ? "bg-secondary text-secondary-foreground font-medium"
                          : "bg-white/5 hover:bg-white/10 text-white/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reminders */}
              {remindersSupported && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {reminderSettings.enabled ? (
                        <Bell className="h-4 w-4 text-secondary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-white/40" />
                      )}
                      <span className="text-xs text-white/80">
                        {t({ pt: "Lembretes", en: "Reminders" })}
                      </span>
                    </div>
                    <Switch
                      checked={reminderSettings.enabled}
                      onCheckedChange={async (checked) => {
                        if (checked) {
                          await enableReminders();
                        } else {
                          disableReminders();
                        }
                      }}
                    />
                  </div>

                  {reminderSettings.enabled && (
                    <div className="space-y-3 animate-fade-in">
                      {/* Interval */}
                      <div>
                        <p className="text-xs text-white/50 mb-1.5">
                          {t({ pt: "Intervalo", en: "Interval" })}
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {INTERVAL_OPTIONS.map((option) => (
                            <button
                              key={option.minutes}
                              onClick={() => updateReminderSettings({ intervalMinutes: option.minutes })}
                              className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                                reminderSettings.intervalMinutes === option.minutes
                                  ? "bg-secondary text-secondary-foreground font-medium"
                                  : "bg-white/5 hover:bg-white/10 text-white/80"
                              }`}
                            >
                              {t(option.label)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quiet hours info */}
                      <p className="text-xs text-white/40">
                        {t({ 
                          pt: `Silenciado: ${reminderSettings.quietStart}h - ${reminderSettings.quietEnd}h`, 
                          en: `Quiet hours: ${reminderSettings.quietStart}:00 - ${reminderSettings.quietEnd}:00` 
                        })}
                      </p>
                    </div>
                  )}

                  {permissionStatus === "denied" && (
                    <p className="text-xs text-warning mt-2">
                      {t({ 
                        pt: "Notificações bloqueadas no browser", 
                        en: "Notifications blocked in browser" 
                      })}
                    </p>
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>
          <button
            onClick={resetToday}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={t({ pt: "Reiniciar", en: "Reset" })}
          >
            <RotateCcw className="h-4 w-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Glasses Grid */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 py-3">
        {glasses.map((glass, index) => (
          <WaterGlass
            key={index}
            index={index}
            filled={glass.filled}
            justFilled={glass.justFilled}
          />
        ))}
      </div>

      {/* Progress Text */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-white">{cupsConsumed}</span>
        <span className="text-lg text-white/60 mx-1">/</span>
        <span className="text-lg text-white/80">{cupsGoal}</span>
        <span className="text-sm text-white/70 ml-2">
          {t({ pt: "copos", en: "cups" })}
        </span>
      </div>

      {/* Celebration */}
      {showCelebration && (
        <div className="mb-4 p-3 rounded-xl bg-success/20 text-success text-center text-sm font-medium animate-scale-in">
          <span className="inline-block animate-bounce">🎉</span>
          {" "}{t({ pt: "Parabéns! Meta atingida!", en: "Congratulations! Goal reached!" })}{" "}
          <span className="inline-block animate-bounce" style={{ animationDelay: "100ms" }}>💧</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={removeCup}
          disabled={data.consumed === 0}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label={t({ pt: "Remover copo", en: "Remove cup" })}
        >
          <Minus className="h-5 w-5 text-white" />
        </button>
        
        <button
          onClick={addCup}
          disabled={cupsConsumed >= cupsGoal}
          className="group relative p-5 rounded-2xl bg-secondary hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-secondary/30"
          aria-label={t({ pt: "Adicionar copo", en: "Add cup" })}
        >
          <Plus className="h-7 w-7 text-secondary-foreground transition-transform group-hover:rotate-90" />
          {/* Ripple effect on hover */}
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none" />
        </button>

        <div className="w-[52px]" /> {/* Spacer for visual balance */}
      </div>

      {/* Quick tip */}
      <p className="text-xs text-white/70 text-center mt-4">
        {t({
          pt: "Toca no + cada vez que bebes um copo 💧",
          en: "Tap + each time you drink a glass 💧",
        })}
      </p>

      {/* Add wave animation keyframes */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(-25%) rotate(2deg); }
          50% { transform: translateX(0%) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}
