import { useState } from "react";
import { useMealReminders, ReminderSettings } from "@/hooks/useMealReminders";
import { Bell, BellOff, X, Clock, Sun, Sunrise, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface MealRemindersSettingsProps {
  onClose: () => void;
}

const mealConfig = {
  breakfast: { icon: Sunrise, label: "Breakfast", color: "text-amber-400" },
  lunch: { icon: Sun, label: "Lunch", color: "text-yellow-400" },
  dinner: { icon: Moon, label: "Dinner", color: "text-indigo-400" },
} as const;

export function MealRemindersSettings({ onClose }: MealRemindersSettingsProps) {
  const {
    settings,
    updateMealTime,
    toggleMeal,
    toggleReminders,
    notificationPermission,
  } = useMealReminders();

  const [isTogglingReminders, setIsTogglingReminders] = useState(false);

  const handleToggleReminders = async () => {
    setIsTogglingReminders(true);
    await toggleReminders();
    setIsTogglingReminders(false);
  };

  const isUnsupported = notificationPermission === "unsupported";
  const isDenied = notificationPermission === "denied";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 glass-card rounded-2xl p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Meal Reminders</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Unsupported warning */}
        {isUnsupported && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <p className="text-sm text-warning">
              Notifications are not supported in this browser. Try using Chrome or Safari.
            </p>
          </div>
        )}

        {/* Denied warning */}
        {isDenied && !isUnsupported && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <p className="text-sm text-destructive">
              Notification permission was denied. Please enable notifications in your browser settings.
            </p>
          </div>
        )}

        {/* Master toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Enable Reminders</p>
              <p className="text-xs text-muted-foreground">
                Get notified at meal times
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggleReminders}
            disabled={isUnsupported || isDenied || isTogglingReminders}
          />
        </div>

        {/* Meal times */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Reminder Times</p>
          
          {(["breakfast", "lunch", "dinner"] as const).map((meal) => {
            const config = mealConfig[meal];
            const Icon = config.icon;
            const mealSettings = settings[meal];
            
            return (
              <div 
                key={meal}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  mealSettings.enabled && settings.enabled
                    ? "bg-card border-border"
                    : "bg-muted/30 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${mealSettings.enabled ? config.color : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-medium">{config.label}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <Input
                        type="time"
                        value={mealSettings.time}
                        onChange={(e) => updateMealTime(meal, e.target.value)}
                        disabled={!settings.enabled}
                        className="h-7 w-24 text-xs px-2 bg-background"
                      />
                    </div>
                  </div>
                </div>
                <Switch
                  checked={mealSettings.enabled}
                  onCheckedChange={() => toggleMeal(meal)}
                  disabled={!settings.enabled}
                />
              </div>
            );
          })}
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground/60 text-center">
          Reminders work when the app is open in your browser
        </p>

        {/* Done button */}
        <button
          onClick={onClose}
          className="w-full py-3 btn-primary rounded-xl font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
}
