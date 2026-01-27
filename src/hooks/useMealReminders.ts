import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "caloriespot_reminders";

export interface ReminderSettings {
  enabled: boolean;
  breakfast: { enabled: boolean; time: string };
  lunch: { enabled: boolean; time: string };
  dinner: { enabled: boolean; time: string };
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  breakfast: { enabled: true, time: "08:00" },
  lunch: { enabled: true, time: "12:30" },
  dinner: { enabled: true, time: "18:30" },
};

interface UseMealRemindersReturn {
  settings: ReminderSettings;
  updateSettings: (newSettings: Partial<ReminderSettings>) => void;
  updateMealTime: (meal: "breakfast" | "lunch" | "dinner", time: string) => void;
  toggleMeal: (meal: "breakfast" | "lunch" | "dinner") => void;
  toggleReminders: () => Promise<boolean>;
  notificationPermission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<boolean>;
}

function isNotificationsSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationsSupported()) return "unsupported";
  return Notification.permission;
}

export function useMealReminders(): UseMealRemindersReturn {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(
    getNotificationPermission()
  );
  const checkIntervalRef = useRef<number | null>(null);
  const lastNotifiedRef = useRef<Record<string, string>>({});

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (err) {
      console.error("[useMealReminders] Failed to load settings:", err);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: ReminderSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (err) {
      console.error("[useMealReminders] Failed to save settings:", err);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isNotificationsSupported()) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === "granted";
    } catch (err) {
      console.error("[useMealReminders] Permission request failed:", err);
      return false;
    }
  }, []);

  // Show notification
  const showNotification = useCallback((meal: string, time: string) => {
    if (notificationPermission !== "granted") return;

    const titles: Record<string, string> = {
      breakfast: "🌅 Breakfast Time!",
      lunch: "☀️ Lunch Time!",
      dinner: "🌙 Dinner Time!",
    };

    const bodies: Record<string, string> = {
      breakfast: "Start your day right! Don't forget to log your breakfast.",
      lunch: "Time for a midday meal. Remember to track what you eat!",
      dinner: "Evening meal time. Log your dinner to stay on track!",
    };

    try {
      new Notification(titles[meal] || "Meal Reminder", {
        body: bodies[meal] || "Time to log your meal!",
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: `meal-reminder-${meal}`,
        requireInteraction: false,
      });
    } catch (err) {
      console.error("[useMealReminders] Failed to show notification:", err);
    }
  }, [notificationPermission]);

  // Check if it's time for a reminder
  const checkReminders = useCallback(() => {
    if (!settings.enabled || notificationPermission !== "granted") return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const today = now.toDateString();

    const meals: Array<"breakfast" | "lunch" | "dinner"> = ["breakfast", "lunch", "dinner"];

    for (const meal of meals) {
      const mealSettings = settings[meal];
      if (!mealSettings.enabled) continue;

      // Check if current time matches meal time (within the same minute)
      if (currentTime === mealSettings.time) {
        const lastNotified = lastNotifiedRef.current[meal];
        
        // Only notify once per day per meal
        if (lastNotified !== today) {
          lastNotifiedRef.current[meal] = today;
          showNotification(meal, mealSettings.time);
        }
      }
    }
  }, [settings, notificationPermission, showNotification]);

  // Set up reminder checking interval
  useEffect(() => {
    if (settings.enabled && notificationPermission === "granted") {
      // Check every 30 seconds
      checkIntervalRef.current = window.setInterval(checkReminders, 30000);
      // Also check immediately
      checkReminders();
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [settings.enabled, notificationPermission, checkReminders]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Update meal time
  const updateMealTime = useCallback((meal: "breakfast" | "lunch" | "dinner", time: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [meal]: { ...prev[meal], time },
      };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Toggle individual meal
  const toggleMeal = useCallback((meal: "breakfast" | "lunch" | "dinner") => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [meal]: { ...prev[meal], enabled: !prev[meal].enabled },
      };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Toggle reminders (with permission request)
  const toggleReminders = useCallback(async (): Promise<boolean> => {
    if (!settings.enabled) {
      // Turning on - request permission first
      const granted = await requestPermission();
      if (granted) {
        updateSettings({ enabled: true });
        return true;
      }
      return false;
    } else {
      // Turning off
      updateSettings({ enabled: false });
      return true;
    }
  }, [settings.enabled, requestPermission, updateSettings]);

  return {
    settings,
    updateSettings,
    updateMealTime,
    toggleMeal,
    toggleReminders,
    notificationPermission,
    requestPermission,
  };
}
