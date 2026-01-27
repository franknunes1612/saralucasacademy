/**
 * Utility functions for safe nutrition value handling
 * Prevents NaN values from appearing in the UI
 */

/**
 * Safe number conversion - prevents NaN values
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Format calorie display with safe number handling
 * Returns "—" for null/invalid values
 */
export function formatCaloriesSafe(
  calories: number | { min: number; max: number } | null | undefined,
  showEstimate: boolean = true
): string {
  if (calories === null || calories === undefined) return "—";
  
  if (typeof calories === "object") {
    const min = safeNumber(calories.min, 0);
    const max = safeNumber(calories.max, 0);
    if (min === 0 && max === 0) return "—";
    return showEstimate ? `~${min}-${max}` : `${min}-${max}`;
  }
  
  const num = safeNumber(calories, 0);
  if (num === 0) return "—";
  return showEstimate ? `~${Math.round(num)}` : String(Math.round(num));
}

/**
 * Format macro value with safe number handling
 * Returns "0" for null/invalid values
 */
export function formatMacroSafe(value: number | null | undefined): string {
  const num = safeNumber(value, 0);
  const rounded = Math.round(num * 10) / 10;
  return String(rounded);
}

/**
 * Sanitize macros object - ensures all values are valid numbers
 */
export function sanitizeMacros(
  macros: { protein?: number; carbs?: number; fat?: number } | null | undefined
): { protein: number; carbs: number; fat: number } | null {
  if (!macros) return null;
  
  const protein = safeNumber(macros.protein, 0);
  const carbs = safeNumber(macros.carbs, 0);
  const fat = safeNumber(macros.fat, 0);
  
  return { protein, carbs, fat };
}

/**
 * Check if a value is a valid finite number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Get display-safe calorie value for calculations
 */
export function getCalorieValue(
  calories: number | { min: number; max: number } | null | undefined
): number {
  if (calories === null || calories === undefined) return 0;
  
  if (typeof calories === "object") {
    const min = safeNumber(calories.min, 0);
    const max = safeNumber(calories.max, 0);
    return Math.round((min + max) / 2);
  }
  
  return safeNumber(calories, 0);
}

/**
 * Check if calorie data is available and valid
 */
export function hasValidCalories(
  calories: number | { min: number; max: number } | null | undefined
): boolean {
  const value = getCalorieValue(calories);
  return value > 0;
}

/**
 * Check if macros have any valid values
 */
export function hasValidMacros(
  macros: { protein?: number; carbs?: number; fat?: number } | null | undefined
): boolean {
  if (!macros) return false;
  const p = safeNumber(macros.protein, 0);
  const c = safeNumber(macros.carbs, 0);
  const f = safeNumber(macros.fat, 0);
  return p > 0 || c > 0 || f > 0;
}

/**
 * Infer macros from calories when not available
 * Uses a conservative balanced ratio for unknown foods
 */
export function inferMacrosFromCalories(
  calories: number | { min: number; max: number } | null | undefined
): { protein: number; carbs: number; fat: number } {
  const cal = getCalorieValue(calories);
  if (cal <= 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  // Conservative balanced ratios: 20% protein, 50% carbs, 30% fat
  const protein = Math.round((cal * 0.20) / 4); // 4 kcal/g
  const carbs = Math.round((cal * 0.50) / 4);   // 4 kcal/g
  const fat = Math.round((cal * 0.30) / 9);     // 9 kcal/g
  
  return { protein, carbs, fat };
}

/**
 * Ensure macros are never null when calories exist
 * Either uses provided macros or infers from calories
 */
export function ensureMacros(
  macros: { protein?: number; carbs?: number; fat?: number } | null | undefined,
  calories: number | { min: number; max: number } | null | undefined
): { protein: number; carbs: number; fat: number } | null {
  // If we have valid macros, sanitize and return them
  if (hasValidMacros(macros)) {
    return sanitizeMacros(macros);
  }
  
  // If we have calories but no macros, infer them
  if (hasValidCalories(calories)) {
    return inferMacrosFromCalories(calories);
  }
  
  // No calories, no macros
  return null;
}
