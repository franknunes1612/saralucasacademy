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
          className="p-1.5 rounded-full hover:bg-secondary/80 transition-colors"
          aria-label="O que significam os macros"
        >
          <Info className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-4 glass-card text-sm space-y-3"
        side="top"
        sideOffset={8}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
          O que são macronutrientes?
        </p>
        
        <div className="space-y-2.5">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-400">Proteína</p>
              <p className="text-xs text-muted-foreground">
                Ajuda na saciedade e manutenção muscular
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-400">Carboidratos</p>
              <p className="text-xs text-muted-foreground">
                Fonte principal de energia
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <div>
              <p className="font-medium text-rose-400">Gordura</p>
              <p className="text-xs text-muted-foreground">
                Mais calórica, essencial em pequenas quantidades
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
