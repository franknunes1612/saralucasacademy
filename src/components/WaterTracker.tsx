import { useState, useEffect } from "react";
import { Droplets, Plus, Minus, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Progress } from "@/components/ui/progress";

const STORAGE_KEY = "sara-lucas-water-tracker";
const DEFAULT_GOAL_ML = 2000; // 2 liters
const CUP_SIZE_ML = 250; // 250ml per cup

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
      // Reset if it's a new day
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

export function WaterTracker() {
  const { t } = useLanguage();
  const [data, setData] = useState<WaterData>(loadWaterData);

  useEffect(() => {
    saveWaterData(data);
  }, [data]);

  const cupsConsumed = Math.floor(data.consumed / CUP_SIZE_ML);
  const cupsGoal = Math.floor(data.goal / CUP_SIZE_ML);
  const progress = Math.min((data.consumed / data.goal) * 100, 100);
  const isGoalReached = data.consumed >= data.goal;

  const addCup = () => {
    setData((prev) => ({
      ...prev,
      consumed: prev.consumed + CUP_SIZE_ML,
    }));
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
  };

  return (
    <div className="result-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-secondary/20 text-secondary">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {t({ pt: "Contador de Água", en: "Water Tracker" })}
            </h3>
            <p className="text-xs text-white/60">
              {t({ pt: `Meta: ${data.goal / 1000}L por dia`, en: `Goal: ${data.goal / 1000}L per day` })}
            </p>
          </div>
        </div>
        <button
          onClick={resetToday}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={t({ pt: "Reiniciar", en: "Reset" })}
        >
          <RotateCcw className="h-4 w-4 text-white/40" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-white">
            {cupsConsumed}/{cupsGoal}
          </span>
          <span className="text-sm text-white/60">
            {t({ pt: "copos", en: "cups" })} ({CUP_SIZE_ML}ml)
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-3 bg-white/10"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/50">
            {(data.consumed / 1000).toFixed(1)}L
          </span>
          <span className="text-xs text-white/50">
            {(data.goal / 1000).toFixed(1)}L
          </span>
        </div>
      </div>

      {/* Goal reached message */}
      {isGoalReached && (
        <div className="mb-4 p-3 rounded-xl bg-success/20 text-success text-center text-sm font-medium">
          🎉 {t({ pt: "Parabéns! Meta atingida!", en: "Congratulations! Goal reached!" })}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={removeCup}
          disabled={data.consumed === 0}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={t({ pt: "Remover copo", en: "Remove cup" })}
        >
          <Minus className="h-5 w-5 text-white" />
        </button>
        
        <button
          onClick={addCup}
          className="p-4 rounded-2xl bg-secondary hover:bg-secondary/80 active:scale-95 transition-all shadow-lg shadow-secondary/30"
          aria-label={t({ pt: "Adicionar copo", en: "Add cup" })}
        >
          <Plus className="h-6 w-6 text-secondary-foreground" />
        </button>

        <div className="w-[52px]" /> {/* Spacer for visual balance */}
      </div>

      {/* Quick tip */}
      <p className="text-xs text-white/50 text-center mt-4">
        {t({
          pt: "Toca no + cada vez que bebes um copo de água",
          en: "Tap + each time you drink a glass of water",
        })}
      </p>
    </div>
  );
}
