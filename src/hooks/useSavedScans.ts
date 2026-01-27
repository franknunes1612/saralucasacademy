import { useState, useEffect, useCallback, useRef } from "react";

const DB_NAME = "spotter_db";
const STORE_NAME = "saved_scans";
const DB_VERSION = 2; // Bumped for schema change
const MAX_SCANS = 100;

export interface SavedScan {
  id: string;
  timestamp: string;
  vehicleType: "car" | "motorcycle" | "unknown";
  make: string | null;
  model: string | null;
  confidenceScore: number | null;
  spotScore: number | null;
  similarModels: string[] | null;
  source?: "camera" | "gallery";
}

interface UseSavedScansReturn {
  scans: SavedScan[];
  saveScan: (scan: Omit<SavedScan, "id" | "timestamp">) => Promise<boolean>;
  deleteScan: (id: string) => Promise<void>;
  clearAllScans: () => Promise<void>;
  getScanById: (id: string) => SavedScan | null;
  storageError: string | null;
  isLoading: boolean;
  isSupported: boolean;
  reloadScans: () => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Check if IndexedDB is available
function isIndexedDBAvailable(): boolean {
  try {
    if (typeof indexedDB === "undefined") return false;
    // Test if we can actually open a database (some iOS modes block this)
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

// Open or create the IndexedDB database
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
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

// Load all scans from IndexedDB
async function loadScansFromDB(): Promise<SavedScan[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to load scans"));
    };

    request.onsuccess = () => {
      db.close();
      const scans = request.result as SavedScan[];
      // Sort by timestamp descending (newest first)
      scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(scans);
    };
  });
}

// Save a scan to IndexedDB
async function saveScanToDB(scan: SavedScan): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(scan);

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to save scan"));
    };

    request.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

// Delete a scan from IndexedDB
async function deleteScanFromDB(id: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to delete scan"));
    };

    request.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

// Clear all scans from IndexedDB
async function clearAllScansFromDB(): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => {
      db.close();
      reject(new Error("Failed to clear scans"));
    };

    request.onsuccess = () => {
      db.close();
      resolve();
    };
  });
}

// Trim scans to max limit
async function trimScansInDB(maxScans: number): Promise<void> {
  const scans = await loadScansFromDB();
  
  if (scans.length <= maxScans) return;

  const scansToDelete = scans.slice(maxScans);
  
  for (const scan of scansToDelete) {
    await deleteScanFromDB(scan.id);
  }
}

export function useSavedScans(): UseSavedScansReturn {
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);
  const loadedRef = useRef(false);

  // Load scans function - can be called on demand
  const loadScans = useCallback(async () => {
    if (!isIndexedDBAvailable()) {
      setIsSupported(false);
      setStorageError("Saved scans not supported on this device");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const loaded = await loadScansFromDB();
      setScans(loaded);
      setStorageError(null);
    } catch (err) {
      console.error("[useSavedScans] Failed to load scans:", err);
      setStorageError("Could not load saved scans");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load scans on mount
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadScans();
    }
  }, [loadScans]);

  // Reload on visibility change (app resume from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadScans();
      }
    };

    // Also handle pageshow for iOS Safari back-forward cache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        loadScans();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loadScans]);

  const saveScan = useCallback(async (scanData: Omit<SavedScan, "id" | "timestamp">): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    setStorageError(null);
    
    const newScan: SavedScan = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...scanData,
    };

    try {
      await saveScanToDB(newScan);
      await trimScansInDB(MAX_SCANS);
      
      // Update local state
      setScans((prev) => [newScan, ...prev].slice(0, MAX_SCANS));
      return true;
    } catch (err) {
      console.error("[useSavedScans] Failed to save scan:", err);
      setStorageError("Could not save scan. Storage may be full.");
      return false;
    }
  }, [isSupported]);

  const deleteScan = useCallback(async (id: string) => {
    if (!isSupported) return;

    try {
      await deleteScanFromDB(id);
      setScans((prev) => prev.filter((scan) => scan.id !== id));
    } catch (err) {
      console.error("[useSavedScans] Failed to delete scan:", err);
      setStorageError("Could not delete scan");
    }
  }, [isSupported]);

  const clearAllScans = useCallback(async () => {
    if (!isSupported) return;

    try {
      await clearAllScansFromDB();
      setScans([]);
    } catch (err) {
      console.error("[useSavedScans] Failed to clear scans:", err);
      setStorageError("Could not clear scans");
    }
  }, [isSupported]);

  const getScanById = useCallback((id: string): SavedScan | null => {
    return scans.find((scan) => scan.id === id) ?? null;
  }, [scans]);

  return {
    scans,
    saveScan,
    deleteScan,
    clearAllScans,
    getScanById,
    storageError,
    isLoading,
    isSupported,
    reloadScans: loadScans,
  };
}
