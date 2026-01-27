import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function MacroInfoTooltip() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-1 rounded-full hover:bg-secondary/80 transition-colors"
          aria-label="What do the colors mean?"
        >
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-4 glass-card text-sm"
        side="top"
        sideOffset={8}
      >
        <p className="text-xs text-muted-foreground font-medium mb-3">
          What are macros?
        </p>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full mt-1 bg-[hsl(210,70%,58%)]" />
            <div>
              <span className="text-xs font-medium macro-protein">Protein</span>
              <p className="text-xs text-muted-foreground">Muscle repair & satiety</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full mt-1 bg-[hsl(45,90%,55%)]" />
            <div>
              <span className="text-xs font-medium macro-carbs">Carbs</span>
              <p className="text-xs text-muted-foreground">Energy for body & brain</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full mt-1 bg-[hsl(280,60%,60%)]" />
            <div>
              <span className="text-xs font-medium macro-fat">Fat</span>
              <p className="text-xs text-muted-foreground">Hormones & nutrient absorption</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/70 mt-3 pt-2 border-t border-border/50">
          Values estimated from image analysis
        </p>
      </PopoverContent>
    </Popover>
  );
}
