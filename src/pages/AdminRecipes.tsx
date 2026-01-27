import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, LogOut, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRecipes, DbRecipe } from "@/hooks/useRecipes";
import { useLanguage } from "@/hooks/useLanguage";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminRecipes() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { recipes, isLoading, error, refetch, deleteRecipe } = useAdminRecipes();

  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<DbRecipe | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin");
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-white/60">
          {t({ pt: "A verificar...", en: "Checking..." })}
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">
            {t({ pt: "Acesso Negado", en: "Access Denied" })}
          </h1>
        </div>
        <div className="result-card p-6 text-center">
          <p className="text-white/70 mb-4">
            {t({
              pt: "Não tem permissões de administrador.",
              en: "You don't have admin permissions.",
            })}
          </p>
          <p className="text-xs text-white/50">
            {t({
              pt: "Contacte o administrador para obter acesso.",
              en: "Contact the administrator for access.",
            })}
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = (recipe: DbRecipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t({ pt: "Tem certeza?", en: "Are you sure?" }))) return;

    setDeletingId(id);
    try {
      await deleteRecipe(id);
      toast.success(t({ pt: "Receita eliminada", en: "Recipe deleted" }));
    } catch (err) {
      toast.error(t({ pt: "Erro ao eliminar", en: "Failed to delete" }));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  const categoryColors = {
    light: "bg-success/20 text-success",
    balanced: "bg-primary/20 text-primary",
    rich: "bg-secondary/20 text-secondary",
  };

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t({ pt: "Gerir Receitas", en: "Manage Recipes" })}
            </h1>
            <p className="text-xs text-white/60">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          title={t({ pt: "Sair", en: "Sign out" })}
        >
          <LogOut className="h-5 w-5 text-white/60" />
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={() => {
          setEditingRecipe(null);
          setShowForm(true);
        }}
        className="w-full py-4 btn-primary rounded-xl font-semibold flex items-center justify-center gap-2 mb-6"
      >
        <Plus className="h-5 w-5" />
        {t({ pt: "Nova Receita", en: "New Recipe" })}
      </button>

      {/* Error state */}
      {error && (
        <div className="result-card p-4 mb-4 border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 text-sm text-primary hover:underline"
          >
            {t({ pt: "Tentar novamente", en: "Try again" })}
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="result-card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-32" />
                  <div className="h-3 bg-white/10 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe list */}
      {!isLoading && (
        <div className="space-y-3">
          {recipes.length === 0 ? (
            <div className="result-card p-6 text-center">
              <p className="text-white/60">
                {t({ pt: "Nenhuma receita ainda", en: "No recipes yet" })}
              </p>
            </div>
          ) : (
            recipes.map((recipe) => (
              <div
                key={recipe.id}
                className={cn(
                  "result-card p-4 transition-opacity",
                  !recipe.is_active && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Image/Emoji */}
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.name_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{recipe.image_emoji}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white text-sm truncate">
                        {language === "pt" ? recipe.name_pt : recipe.name_en}
                      </p>
                      {!recipe.is_active && (
                        <EyeOff className="h-3 w-3 text-white/40 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span>~{recipe.calories} kcal</span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          categoryColors[recipe.category]
                        )}
                      >
                        {recipe.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title={t({ pt: "Editar", en: "Edit" })}
                    >
                      <Edit2 className="h-4 w-4 text-white/60" />
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      disabled={deletingId === recipe.id}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title={t({ pt: "Eliminar", en: "Delete" })}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recipe Form Modal */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={() => {
            setShowForm(false);
            setEditingRecipe(null);
          }}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
