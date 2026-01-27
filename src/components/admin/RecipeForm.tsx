import { useState, useEffect } from "react";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DbRecipe, useAdminRecipes } from "@/hooks/useRecipes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecipeFormProps {
  recipe?: DbRecipe | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "light", label: { pt: "Leve", en: "Light" } },
  { value: "balanced", label: { pt: "Equilibrado", en: "Balanced" } },
  { value: "rich", label: { pt: "Rico", en: "Rich" } },
];

const MEAL_TYPE_OPTIONS = [
  { value: "any", label: { pt: "Qualquer", en: "Any" } },
  { value: "breakfast", label: { pt: "Pequeno-almoço", en: "Breakfast" } },
  { value: "lunch", label: { pt: "Almoço", en: "Lunch" } },
  { value: "dinner", label: { pt: "Jantar", en: "Dinner" } },
  { value: "snack", label: { pt: "Lanche", en: "Snack" } },
];

const EMOJI_OPTIONS = ["🥗", "🍲", "🥑", "🍳", "🥩", "🐟", "🍝", "🌯", "🍓", "🥣", "🍗", "🥙"];

export function RecipeForm({ recipe, onClose, onSaved }: RecipeFormProps) {
  const { language, t } = useLanguage();
  const { createRecipe, updateRecipe, uploadImage } = useAdminRecipes();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name_pt: "",
    name_en: "",
    description_pt: "",
    description_en: "",
    category: "balanced" as "light" | "balanced" | "rich",
    meal_type: "any",
    calories: 400,
    protein: 20,
    carbs: 40,
    fat: 15,
    ingredients_pt: [""],
    ingredients_en: [""],
    steps_pt: [""],
    steps_en: [""],
    prep_time: 20,
    portion_pt: "1 porção",
    portion_en: "1 serving",
    image_emoji: "🥗",
    is_active: true,
  });

  // Load recipe data for editing
  useEffect(() => {
    if (recipe) {
      setFormData({
        name_pt: recipe.name_pt,
        name_en: recipe.name_en,
        description_pt: recipe.description_pt || "",
        description_en: recipe.description_en || "",
        category: recipe.category,
        meal_type: recipe.meal_type || "any",
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        ingredients_pt: recipe.ingredients_pt.length ? recipe.ingredients_pt : [""],
        ingredients_en: recipe.ingredients_en.length ? recipe.ingredients_en : [""],
        steps_pt: recipe.steps_pt.length ? recipe.steps_pt : [""],
        steps_en: recipe.steps_en.length ? recipe.steps_en : [""],
        prep_time: recipe.prep_time || 20,
        portion_pt: recipe.portion_pt || "1 porção",
        portion_en: recipe.portion_en || "1 serving",
        image_emoji: recipe.image_emoji || "🥗",
        is_active: recipe.is_active,
      });
      if (recipe.image_url) {
        setImagePreview(recipe.image_url);
      }
    }
  }, [recipe]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t({ pt: "Imagem muito grande (max 5MB)", en: "Image too large (max 5MB)" }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addListItem = (field: "ingredients_pt" | "ingredients_en" | "steps_pt" | "steps_en") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateListItem = (
    field: "ingredients_pt" | "ingredients_en" | "steps_pt" | "steps_en",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeListItem = (
    field: "ingredients_pt" | "ingredients_en" | "steps_pt" | "steps_en",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = recipe?.image_url || null;

      // Upload image if new one selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const recipeData = {
        ...formData,
        image_url: imageUrl,
        ingredients_pt: formData.ingredients_pt.filter((i) => i.trim()),
        ingredients_en: formData.ingredients_en.filter((i) => i.trim()),
        steps_pt: formData.steps_pt.filter((s) => s.trim()),
        steps_en: formData.steps_en.filter((s) => s.trim()),
      };

      if (recipe) {
        await updateRecipe(recipe.id, recipeData);
        toast.success(t({ pt: "Receita atualizada!", en: "Recipe updated!" }));
      } else {
        await createRecipe(recipeData);
        toast.success(t({ pt: "Receita criada!", en: "Recipe created!" }));
      }

      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t({ pt: "Erro ao guardar", en: "Failed to save" })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto py-4">
      <div className="bg-background rounded-2xl w-full max-w-lg mx-4 my-4 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-background rounded-t-2xl border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-semibold text-white">
            {recipe
              ? t({ pt: "Editar Receita", en: "Edit Recipe" })
              : t({ pt: "Nova Receita", en: "New Recipe" })}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Image upload */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              {t({ pt: "Imagem", en: "Image" })}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">{formData.image_emoji}</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="btn-secondary px-4 py-2 rounded-lg text-sm cursor-pointer inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {t({ pt: "Carregar", en: "Upload" })}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <div className="flex gap-1 flex-wrap">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image_emoji: emoji }))}
                      className={cn(
                        "w-8 h-8 rounded-lg text-lg transition-colors",
                        formData.image_emoji === emoji
                          ? "bg-primary/30"
                          : "bg-white/10 hover:bg-white/20"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Nome (PT)", en: "Name (PT)" })}
              </label>
              <input
                type="text"
                value={formData.name_pt}
                onChange={(e) => setFormData((p) => ({ ...p, name_pt: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Nome (EN)", en: "Name (EN)" })}
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData((p) => ({ ...p, name_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                maxLength={100}
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Descrição (PT)", en: "Description (PT)" })}
              </label>
              <textarea
                value={formData.description_pt}
                onChange={(e) => setFormData((p) => ({ ...p, description_pt: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2}
                maxLength={500}
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Descrição (EN)", en: "Description (EN)" })}
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData((p) => ({ ...p, description_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2}
                maxLength={500}
              />
            </div>
          </div>

          {/* Category & Meal Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Categoria", en: "Category" })}
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    category: e.target.value as "light" | "balanced" | "rich",
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background">
                    {opt.label[language]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Tipo de Refeição", en: "Meal Type" })}
              </label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData((p) => ({ ...p, meal_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MEAL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background">
                    {opt.label[language]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              {t({ pt: "Nutrição (estimada)", en: "Nutrition (estimated)" })}
            </label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-white/60 block">kcal</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, calories: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-2 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  min={1}
                  max={5000}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block">
                  {t({ pt: "Prot (g)", en: "Prot (g)" })}
                </label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, protein: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-2 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block">
                  {t({ pt: "Carb (g)", en: "Carb (g)" })}
                </label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, carbs: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-2 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block">
                  {t({ pt: "Gord (g)", en: "Fat (g)" })}
                </label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, fat: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-2 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Prep time and Portion */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Tempo (min)", en: "Time (min)" })}
              </label>
              <input
                type="number"
                value={formData.prep_time}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, prep_time: parseInt(e.target.value) || 15 }))
                }
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                min={1}
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Porção (PT)", en: "Portion (PT)" })}
              </label>
              <input
                type="text"
                value={formData.portion_pt}
                onChange={(e) => setFormData((p) => ({ ...p, portion_pt: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                {t({ pt: "Porção (EN)", en: "Portion (EN)" })}
              </label>
              <input
                type="text"
                value={formData.portion_en}
                onChange={(e) => setFormData((p) => ({ ...p, portion_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
              />
            </div>
          </div>

          {/* Ingredients PT */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              {t({ pt: "Ingredientes (PT)", en: "Ingredients (PT)" })}
            </label>
            <div className="space-y-2">
              {formData.ingredients_pt.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => updateListItem("ingredients_pt", i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`${t({ pt: "Ingrediente", en: "Ingredient" })} ${i + 1}`}
                    maxLength={100}
                  />
                  {formData.ingredients_pt.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem("ingredients_pt", i)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("ingredients_pt")}
                className="text-sm text-primary flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t({ pt: "Adicionar", en: "Add" })}
              </button>
            </div>
          </div>

          {/* Ingredients EN */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              {t({ pt: "Ingredientes (EN)", en: "Ingredients (EN)" })}
            </label>
            <div className="space-y-2">
              {formData.ingredients_en.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => updateListItem("ingredients_en", i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Ingredient ${i + 1}`}
                    maxLength={100}
                  />
                  {formData.ingredients_en.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem("ingredients_en", i)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("ingredients_en")}
                className="text-sm text-primary flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t({ pt: "Adicionar", en: "Add" })}
              </button>
            </div>
          </div>

          {/* Steps PT */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              {t({ pt: "Passos (PT)", en: "Steps (PT)" })}
            </label>
            <div className="space-y-2">
              {formData.steps_pt.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-6 h-8 rounded-lg bg-primary/20 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateListItem("steps_pt", i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                    maxLength={500}
                  />
                  {formData.steps_pt.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem("steps_pt", i)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("steps_pt")}
                className="text-sm text-primary flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t({ pt: "Adicionar passo", en: "Add step" })}
              </button>
            </div>
          </div>

          {/* Steps EN */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              {t({ pt: "Passos (EN)", en: "Steps (EN)" })}
            </label>
            <div className="space-y-2">
              {formData.steps_en.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-6 h-8 rounded-lg bg-primary/20 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateListItem("steps_en", i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                    maxLength={500}
                  />
                  {formData.steps_en.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem("steps_en", i)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("steps_en")}
                className="text-sm text-primary flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t({ pt: "Adicionar passo", en: "Add step" })}
              </button>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/80">
              {t({ pt: "Receita ativa", en: "Recipe active" })}
            </span>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                formData.is_active ? "bg-primary" : "bg-white/20"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                  formData.is_active ? "left-6" : "left-0.5"
                )}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 btn-primary rounded-xl font-semibold disabled:opacity-50"
          >
            {isSubmitting
              ? t({ pt: "A guardar...", en: "Saving..." })
              : recipe
              ? t({ pt: "Atualizar Receita", en: "Update Recipe" })
              : t({ pt: "Criar Receita", en: "Create Recipe" })}
          </button>
        </form>
      </div>
    </div>
  );
}
