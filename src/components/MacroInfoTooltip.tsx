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
        className="w-64 p-4 glass-card text-sm"
        side="top"
        sideOffset={8}
      >
        <p className="text-xs text-muted-foreground font-medium mb-3">
          What the colors mean
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(210,70%,58%)]" />
            <span className="text-xs"><span className="macro-protein font-medium">Blue</span> = Protein</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(32,85%,55%)]" />
            <span className="text-xs"><span className="macro-carbs font-medium">Orange</span> = Carbs</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(320,55%,62%)]" />
            <span className="text-xs"><span className="macro-fat font-medium">Pink</span> = Fat</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
