import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sara-lucas-water-reminders";

interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // 60, 90, 120, 180
  quietStart: number; // hour (0-23), e.g. 22 for 10pm
  quietEnd: number; // hour (0-23), e.g. 8 for 8am
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  intervalMinutes: 60,
  quietStart: 22,
  quietEnd: 8,
};

function loadSettings(): ReminderSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load reminder settings:", e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save reminder settings:", e);
  }
}

function isInQuietHours(quietStart: number, quietEnd: number): boolean {
  const now = new Date().getHours();
  if (quietStart > quietEnd) {
    // Quiet hours span midnight (e.g., 22:00 - 08:00)
    return now >= quietStart || now < quietEnd;
  }
  return now >= quietStart && now < quietEnd;
}

export function useWaterReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(loadSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const [lastNotification, setLastNotification] = useState<number>(Date.now());

  // Check notification support and permission
  useEffect(() => {
    if (!("Notification" in window)) {
      setPermissionStatus("unsupported");
      return;
    }
    setPermissionStatus(Notification.permission);
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      setPermissionStatus("granted");
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === "granted";
    }

    return false;
  }, []);

  // Send a notification
  const sendNotification = useCallback(() => {
    if (permissionStatus !== "granted") return;
    if (isInQuietHours(settings.quietStart, settings.quietEnd)) return;

    const messages = [
      { pt: "💧 Hora de beber água!", en: "💧 Time to drink water!" },
      { pt: "💧 Não te esqueças de te hidratar!", en: "💧 Don't forget to hydrate!" },
      { pt: "💧 O teu corpo precisa de água!", en: "💧 Your body needs water!" },
      { pt: "💧 Bebe um copo de água agora!", en: "💧 Drink a glass of water now!" },
    ];

    const lang = navigator.language.startsWith("pt") ? "pt" : "en";
    const message = messages[Math.floor(Math.random() * messages.length)];

    try {
      new Notification(message[lang], {
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: "water-reminder",
      });
      setLastNotification(Date.now());
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  }, [permissionStatus, settings.quietStart, settings.quietEnd]);

  // Set up interval for reminders
  useEffect(() => {
    if (!settings.enabled || permissionStatus !== "granted") {
      return;
    }

    const intervalMs = settings.intervalMinutes * 60 * 1000;
    
    const interval = setInterval(() => {
      sendNotification();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.intervalMinutes, permissionStatus, sendNotification]);

  const updateSettings = useCallback((updates: Partial<ReminderSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const enableReminders = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      updateSettings({ enabled: true });
      return true;
    }
    return false;
  }, [requestPermission, updateSettings]);

  const disableReminders = useCallback(() => {
    updateSettings({ enabled: false });
  }, [updateSettings]);

  return {
    settings,
    updateSettings,
    permissionStatus,
    enableReminders,
    disableReminders,
    sendNotification, // For testing
    isSupported: permissionStatus !== "unsupported",
  };
}
