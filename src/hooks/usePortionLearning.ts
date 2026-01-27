import { useCallback } from "react";

/**
 * Portion adjustment data stored for learning
 */
interface PortionAdjustment {
  category: string;
  baseGrams: number;
  adjustedGrams: number;
  multiplier: number;
  timestamp: number;
}

const STORAGE_KEY = "caloriespot_portion_learning";
const MAX_ENTRIES = 100; // Keep last 100 adjustments

/**
 * Get stored portion adjustments
 */
function getStoredAdjustments(): PortionAdjustment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Store a new adjustment
 */
function storeAdjustment(adjustment: PortionAdjustment): void {
  try {
    const existing = getStoredAdjustments();
    const updated = [...existing, adjustment].slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Calculate average multiplier for a food category based on user history
 * Returns 1.0 if no history or not enough data
 */
function getCategoryBias(category: string): number {
  const adjustments = getStoredAdjustments();
  const categoryAdjustments = adjustments.filter(
    (a) => a.category.toLowerCase() === category.toLowerCase()
  );
  
  if (categoryAdjustments.length < 3) {
    return 1.0; // Not enough data
  }
  
  // Calculate weighted average (more recent = higher weight)
  const now = Date.now();
  let weightedSum = 0;
  let totalWeight = 0;
  
  categoryAdjustments.forEach((adj) => {
    const ageMs = now - adj.timestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    // Decay weight over 30 days
    const weight = Math.max(0.1, 1 - ageDays / 30);
    weightedSum += adj.multiplier * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 1.0;
}

/**
 * Hook for portion learning - stores adjustments and provides biases
 */
export function usePortionLearning() {
  /**
   * Record a portion adjustment for learning
   */
  const recordAdjustment = useCallback((
    category: string,
    baseGrams: number,
    adjustedGrams: number,
    multiplier: number
  ) => {
    // Only record if user actually adjusted (not default)
    if (Math.abs(multiplier - 1.0) < 0.05) {
      return; // User confirmed default, not useful for learning
    }
    
    storeAdjustment({
      category,
      baseGrams,
      adjustedGrams,
      multiplier,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Get suggested multiplier based on user's history with this category
   */
  const getSuggestedMultiplier = useCallback((category: string): number => {
    return getCategoryBias(category);
  }, []);

  /**
   * Get all adjustments for debugging/analytics
   */
  const getHistory = useCallback((): PortionAdjustment[] => {
    return getStoredAdjustments();
  }, []);

  /**
   * Clear learning history
   */
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    recordAdjustment,
    getSuggestedMultiplier,
    getHistory,
    clearHistory,
  };
}
