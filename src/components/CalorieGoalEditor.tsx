import { useState } from "react";
import { X, Target, Minus, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CalorieGoalEditorProps {
  currentGoal: number;
  onSave: (newGoal: number) => void;
  onClose: () => void;
}

const PRESETS = [1500, 1800, 2000, 2200, 2500, 3000];

export function CalorieGoalEditor({ 
  currentGoal, 
  onSave, 
  onClose 
}: CalorieGoalEditorProps) {
  const [goal, setGoal] = useState(currentGoal);

  const handleIncrement = (amount: number) => {
    setGoal(prev => Math.max(500, Math.min(10000, prev + amount)));
  };

  const handleSave = () => {
    onSave(goal);
    onClose();
  };

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
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Set Daily Goal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Current value display */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-primary">{goal}</div>
          <p className="text-sm text-muted-foreground mt-1">calories per day</p>
        </div>
        
        {/* Increment buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleIncrement(-100)}
            className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          
          <Slider
            value={[goal]}
            onValueChange={([value]) => setGoal(value)}
            min={500}
            max={5000}
            step={50}
            className="flex-1 mx-4"
          />
          
          <button
            onClick={() => handleIncrement(100)}
            className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {/* Presets */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Quick presets</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setGoal(preset)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  goal === preset 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/60 text-center">
          Consult a healthcare professional for personalized guidance
        </p>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 btn-secondary rounded-xl text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 btn-primary rounded-xl text-sm font-medium"
          >
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}
