import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "caloriespot_daily_goal";
const DEFAULT_GOAL = 2000;

interface CalorieGoalData {
  goal: number;
  lastUpdated: string;
}

interface UseCalorieGoalReturn {
  goal: number;
  setGoal: (newGoal: number) => void;
  isLoading: boolean;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function useCalorieGoal(): UseCalorieGoalReturn {
  const [goal, setGoalState] = useState<number>(DEFAULT_GOAL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: CalorieGoalData = JSON.parse(stored);
        setGoalState(data.goal);
      }
    } catch (err) {
      console.error("[useCalorieGoal] Failed to load goal:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoal = useCallback((newGoal: number) => {
    const clampedGoal = Math.max(500, Math.min(10000, newGoal));
    setGoalState(clampedGoal);
    
    try {
      const data: CalorieGoalData = {
        goal: clampedGoal,
        lastUpdated: getTodayDateString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("[useCalorieGoal] Failed to save goal:", err);
    }
  }, []);

  return {
    goal,
    setGoal,
    isLoading,
  };
}
