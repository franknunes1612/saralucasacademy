import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, TrendingUp } from "lucide-react";

interface CalorieGoalProgressProps {
  currentCalories: number;
  goalCalories: number;
  onEditGoal?: () => void;
}

export function CalorieGoalProgress({ 
  currentCalories, 
  goalCalories, 
  onEditGoal 
}: CalorieGoalProgressProps) {
  const { percentage, remaining, isOver, status } = useMemo(() => {
    const pct = Math.min((currentCalories / goalCalories) * 100, 100);
    const rem = goalCalories - currentCalories;
    const over = currentCalories > goalCalories;
    
    let statusText: string;
    let statusColor: string;
    
    if (over) {
      statusText = "Over goal";
      statusColor = "text-destructive";
    } else if (pct >= 90) {
      statusText = "Almost there!";
      statusColor = "text-white";
    } else if (pct >= 50) {
      statusText = "On track";
      statusColor = "text-white";
    } else {
      statusText = "Just getting started";
      statusColor = "text-white/70";
    }
    
    return { 
      percentage: pct, 
      remaining: rem, 
      isOver: over,
      status: { text: statusText, color: statusColor }
    };
  }, [currentCalories, goalCalories]);

  return (
    <div className="result-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">Daily Goal</span>
        </div>
        {onEditGoal && (
          <button
            onClick={onEditGoal}
            className="text-xs text-white/80 hover:text-white hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className={`h-3 bg-white/20 ${isOver ? "[&>div]:bg-destructive" : "[&>div]:bg-white"}`}
        />
        
        <div className="flex justify-between text-xs text-white/70">
          <span>{currentCalories} kcal</span>
          <span>{goalCalories} kcal goal</span>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex items-center justify-between pt-2 border-t border-white/15">
        <div className="flex items-center gap-1.5">
          {isOver ? (
            <Flame className="h-4 w-4 text-destructive" />
          ) : (
            <TrendingUp className="h-4 w-4 text-white" />
          )}
          <span className={`text-sm font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>
        
        <div className="text-right">
          {isOver ? (
            <span className="text-sm text-destructive font-medium">
              +{Math.abs(remaining)} kcal over
            </span>
          ) : (
            <span className="text-sm text-white/70">
              {remaining} kcal to go
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
