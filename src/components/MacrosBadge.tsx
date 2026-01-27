interface MacrosBadgeProps {
  macros: { protein: number; carbs: number; fat: number } | null;
}

export function MacrosBadge({ macros }: MacrosBadgeProps) {
  if (!macros) return null;

  return (
    <div className="flex gap-4 justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold text-blue-400">{macros.protein}g</p>
        <p className="text-xs text-muted-foreground">Protein</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-amber-400">{macros.carbs}g</p>
        <p className="text-xs text-muted-foreground">Carbs</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-rose-400">{macros.fat}g</p>
        <p className="text-xs text-muted-foreground">Fat</p>
      </div>
    </div>
  );
}
