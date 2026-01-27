import { Package, Plus, RotateCcw } from "lucide-react";
import { MacrosBadge } from "./MacrosBadge";

interface BarcodeProduct {
  name: string;
  brand: string | null;
  servingSize: string | null;
  calories: number | null;
  caloriesPer100g: number | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  imageUrl: string | null;
}

interface BarcodeResultCardProps {
  product: BarcodeProduct;
  barcode: string;
  onAddToMeals: () => void;
  onScanAgain: () => void;
}

export function BarcodeResultCard({ 
  product, 
  barcode, 
  onAddToMeals, 
  onScanAgain 
}: BarcodeResultCardProps) {
  const displayCalories = product.calories || product.caloriesPer100g;
  const calorieLabel = product.calories ? "per serving" : "per 100g";

  return (
    <div className="result-card p-6 space-y-5 animate-fade-in">
      {/* Product image or icon */}
      <div className="flex justify-center">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="h-24 w-24 object-contain rounded-xl bg-muted"
          />
        ) : (
          <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product name */}
      <div className="text-center">
        <h2 className="text-xl font-bold">{product.name}</h2>
        {product.brand && (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
      </div>

      {/* Calories display */}
      {displayCalories !== null && (
        <div className="text-center py-4">
          <div className="text-5xl font-bold calorie-mid">{Math.round(displayCalories)}</div>
          <p className="text-sm text-muted-foreground mt-1">calories {calorieLabel}</p>
          {product.servingSize && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Serving: {product.servingSize}
            </p>
          )}
        </div>
      )}

      {/* Macros */}
      {product.macros && (
        <MacrosBadge macros={product.macros} />
      )}

      {/* Barcode info */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground/60 font-mono">{barcode}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onScanAgain}
          className="flex-1 py-3 btn-secondary rounded-xl flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Scan Again
        </button>
        <button
          onClick={onAddToMeals}
          className="flex-1 py-3 btn-primary rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add to Meals
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground/50 text-center">
        Data from Open Food Facts · May not be accurate
      </p>
    </div>
  );
}
