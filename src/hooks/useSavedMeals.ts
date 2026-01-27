import { useState, useEffect, useCallback, useRef } from "react";

const DB_NAME = "caloriespot_db";
const STORE_NAME = "saved_meals";
const DB_VERSION = 1;
const MAX_MEALS = 100;

export interface FoodItem {
  name: string;
  portion: "small" | "medium" | "large";
  estimatedCalories: number | null;
}

export interface SavedMeal {
  id: string;
  timestamp: string;
  items: FoodItem[];
  totalCalories: number | { min: number; max: number } | null;
  confidenceScore: number | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  source?: "camera" | "gallery";
}

interface UseSavedMealsReturn {
  meals: SavedMeal[];
  saveMeal: (meal: Omit<SavedMeal, "id" | "timestamp">) => Promise<boolean>;
  deleteMeal: (id: string) => Promise<void>;
  clearAllMeals: () => Promise<void>;
  getMealById: (id: string) => SavedMeal | null;
  storageError: string | null;
  isLoading: boolean;
  isSupported: boolean;
  reloadMeals: () => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isIndexedDBAvailable(): boolean {
  try {
    if (typeof indexedDB === "undefined") return false;
    const testRequest = indexedDB.open("__test_db__");
    testRequest.onerror = () => {};
    testRequest.onsuccess = () => {
      testRequest.result.close();
      indexedDB.deleteDatabase("__test_db__");
    };
    return true;
  } catch {
    return false;
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

async function loadMealsFromDB(): Promise<SavedMeal[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to load meals"));
    };

    request.onsuccess = () => {
      db.close();
      const meals = request.result as SavedMeal[];
      meals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(meals);
    };
  });
}

async function saveMealToDB(meal: SavedMeal): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(meal);

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to save meal"));
    };

    request.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

async function deleteMealFromDB(id: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to delete meal"));
    };

    request.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

async function clearAllMealsFromDB(): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to clear meals"));
    };

    request.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

async function trimMealsInDB(maxMeals: number): Promise<void> {
  const meals = await loadMealsFromDB();
  
  if (meals.length <= maxMeals) return;

  const mealsToDelete = meals.slice(maxMeals);
  
  for (const meal of mealsToDelete) {
    await deleteMealFromDB(meal.id);
  }
}

export function useSavedMeals(): UseSavedMealsReturn {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const loadedRef = useRef(false);

  const loadMeals = useCallback(async () => {
    if (!isIndexedDBAvailable()) {
      setIsSupported(false);
      setStorageError("Saved meals not supported on this device");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const loaded = await loadMealsFromDB();
      setMeals(loaded);
      setStorageError(null);
    } catch (err) {
      console.error("[useSavedMeals] Failed to load meals:", err);
      setStorageError("Could not load saved meals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadMeals();
    }
  }, [loadMeals]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadMeals();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        loadMeals();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loadMeals]);

  const saveMeal = useCallback(async (mealData: Omit<SavedMeal, "id" | "timestamp">): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    setStorageError(null);
    
    const newMeal: SavedMeal = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...mealData,
    };

    try {
      await saveMealToDB(newMeal);
      await trimMealsInDB(MAX_MEALS);
      
      setMeals((prev) => [newMeal, ...prev].slice(0, MAX_MEALS));
      return true;
    } catch (err) {
      console.error("[useSavedMeals] Failed to save meal:", err);
      setStorageError("Could not save meal. Storage may be full.");
      return false;
    }
  }, [isSupported]);

  const deleteMeal = useCallback(async (id: string) => {
    if (!isSupported) return;

    try {
      await deleteMealFromDB(id);
      setMeals((prev) => prev.filter((meal) => meal.id !== id));
    } catch (err) {
      console.error("[useSavedMeals] Failed to delete meal:", err);
      setStorageError("Could not delete meal");
    }
  }, [isSupported]);

  const clearAllMeals = useCallback(async () => {
    if (!isSupported) return;

    try {
      await clearAllMealsFromDB();
      setMeals([]);
    } catch (err) {
      console.error("[useSavedMeals] Failed to clear meals:", err);
      setStorageError("Could not clear meals");
    }
  }, [isSupported]);

  const getMealById = useCallback((id: string): SavedMeal | null => {
    return meals.find((meal) => meal.id === id) ?? null;
  }, [meals]);

  return {
    meals,
    saveMeal,
    deleteMeal,
    clearAllMeals,
    getMealById,
    storageError,
    isLoading,
    isSupported,
    reloadMeals: loadMeals,
  };
}
