import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, LogOut, Save, X, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CmsEntry {
  id: string;
  key: string;
  value_pt: string;
  value_en: string;
  content_type: "text" | "richtext" | "boolean";
  category: string;
  description: string | null;
  updated_at: string;
}

export default function AdminCms() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, signOut } = useAuth();
  const { entries, isLoading, error, refetch, createEntry, updateEntry, deleteEntry, getCategories } = useAdminCmsContent();

  const [editingEntry, setEditingEntry] = useState<CmsEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    key: "",
    value_pt: "",
    value_en: "",
    content_type: "text" as "text" | "richtext" | "boolean",
    category: "general",
    description: "",
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin");
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    try {
      await updateEntry(editingEntry.id, {
        value_pt: editingEntry.value_pt,
        value_en: editingEntry.value_en,
        description: editingEntry.description,
      });
      toast.success(t({ pt: "Conteúdo guardado!", en: "Content saved!" }));
      setEditingEntry(null);
    } catch (err) {
      toast.error(t({ pt: "Erro ao guardar", en: "Failed to save" }));
    }
  };

  const handleCreate = async () => {
    if (!newEntry.key.trim()) {
      toast.error(t({ pt: "Chave obrigatória", en: "Key is required" }));
      return;
    }

    try {
      await createEntry(newEntry);
      toast.success(t({ pt: "Conteúdo criado!", en: "Content created!" }));
      setIsCreating(false);
      setNewEntry({
        key: "",
        value_pt: "",
        value_en: "",
        content_type: "text",
        category: "general",
        description: "",
      });
    } catch (err) {
      toast.error(t({ pt: "Erro ao criar", en: "Failed to create" }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t({ pt: "Tem certeza?", en: "Are you sure?" }))) return;

    setDeletingId(id);
    try {
      await deleteEntry(id);
      toast.success(t({ pt: "Conteúdo eliminado", en: "Content deleted" }));
    } catch (err) {
      toast.error(t({ pt: "Erro ao eliminar", en: "Failed to delete" }));
    } finally {
      setDeletingId(null);
    }
  };

  const categories = getCategories();
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.value_pt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.value_en.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || entry.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categoryColors: Record<string, string> = {
    onboarding: "bg-blue-500/20 text-blue-400",
    camera: "bg-purple-500/20 text-purple-400",
    nutritionist: "bg-green-500/20 text-green-400",
    disclaimers: "bg-yellow-500/20 text-yellow-400",
    recipes: "bg-orange-500/20 text-orange-400",
    premium: "bg-pink-500/20 text-pink-400",
    features: "bg-cyan-500/20 text-cyan-400",
    general: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t({ pt: "Gerir Conteúdo", en: "Manage Content" })}
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

      {/* Search and Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t({ pt: "Pesquisar...", en: "Search..." })}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all" className="bg-background">
            {t({ pt: "Todas", en: "All" })}
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-background">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Add button */}
      <button
        onClick={() => setIsCreating(true)}
        className="w-full py-3 btn-primary rounded-xl font-semibold flex items-center justify-center gap-2 mb-4"
      >
        <Plus className="h-5 w-5" />
        {t({ pt: "Novo Conteúdo", en: "New Content" })}
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
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-40" />
                <div className="h-3 bg-white/10 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content list */}
      {!isLoading && (
        <div className="space-y-3 pb-20">
          {filteredEntries.length === 0 ? (
            <div className="result-card p-6 text-center">
              <p className="text-white/60">
                {t({ pt: "Nenhum conteúdo encontrado", en: "No content found" })}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="result-card p-4">
                {editingEntry?.id === entry.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {entry.key}
                      </code>
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 rounded-lg bg-success/20 hover:bg-success/30 transition-colors"
                        >
                          <Save className="h-4 w-4 text-success" />
                        </button>
                        <button
                          onClick={() => setEditingEntry(null)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <X className="h-4 w-4 text-white/60" />
                        </button>
                      </div>
                    </div>

                    {entry.content_type === "boolean" ? (
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-white/80">
                          {t({ pt: "Ativado", en: "Enabled" })}
                        </label>
                        <button
                          onClick={() =>
                            setEditingEntry({
                              ...editingEntry,
                              value_pt: editingEntry.value_pt === "true" ? "false" : "true",
                              value_en: editingEntry.value_en === "true" ? "false" : "true",
                            })
                          }
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            editingEntry.value_en === "true"
                              ? "bg-success"
                              : "bg-white/20"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                              editingEntry.value_en === "true"
                                ? "translate-x-6"
                                : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs text-white/60 block mb-1">PT</label>
                          <textarea
                            value={editingEntry.value_pt}
                            onChange={(e) =>
                              setEditingEntry({ ...editingEntry, value_pt: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={entry.content_type === "richtext" ? 4 : 2}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 block mb-1">EN</label>
                          <textarea
                            value={editingEntry.value_en}
                            onChange={(e) =>
                              setEditingEntry({ ...editingEntry, value_en: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={entry.content_type === "richtext" ? 4 : 2}
                          />
                        </div>
                      </>
                    )}

                    <input
                      type="text"
                      value={editingEntry.description || ""}
                      onChange={(e) =>
                        setEditingEntry({ ...editingEntry, description: e.target.value })
                      }
                      placeholder={t({ pt: "Descrição...", en: "Description..." })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <code className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded break-all">
                          {entry.key}
                        </code>
                        <span
                          className={cn(
                            "ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium",
                            categoryColors[entry.category] || categoryColors.general
                          )}
                        >
                          {entry.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="h-4 w-4 text-white/60" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {entry.content_type === "boolean" ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            entry.value_en === "true"
                              ? "bg-success/20 text-success"
                              : "bg-red-500/20 text-red-400"
                          )}
                        >
                          {entry.value_en === "true"
                            ? t({ pt: "Ativado", en: "Enabled" })
                            : t({ pt: "Desativado", en: "Disabled" })}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-white/80 line-clamp-2">
                        {language === "pt" ? entry.value_pt : entry.value_en}
                      </p>
                    )}

                    {entry.description && (
                      <p className="text-xs text-white/40 mt-1">{entry.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto py-4">
          <div className="bg-background rounded-2xl w-full max-w-lg mx-4 my-4 animate-scale-in">
            <div className="sticky top-0 bg-background rounded-t-2xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">
                {t({ pt: "Novo Conteúdo", en: "New Content" })}
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  {t({ pt: "Chave", en: "Key" })}
                </label>
                <input
                  type="text"
                  value={newEntry.key}
                  onChange={(e) => setNewEntry((p) => ({ ...p, key: e.target.value }))}
                  placeholder="section.element.property"
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/80 mb-1 block">
                    {t({ pt: "Categoria", en: "Category" })}
                  </label>
                  <select
                    value={newEntry.category}
                    onChange={(e) => setNewEntry((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="general" className="bg-background">general</option>
                    <option value="onboarding" className="bg-background">onboarding</option>
                    <option value="camera" className="bg-background">camera</option>
                    <option value="nutritionist" className="bg-background">nutritionist</option>
                    <option value="disclaimers" className="bg-background">disclaimers</option>
                    <option value="recipes" className="bg-background">recipes</option>
                    <option value="premium" className="bg-background">premium</option>
                    <option value="features" className="bg-background">features</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-1 block">
                    {t({ pt: "Tipo", en: "Type" })}
                  </label>
                  <select
                    value={newEntry.content_type}
                    onChange={(e) =>
                      setNewEntry((p) => ({
                        ...p,
                        content_type: e.target.value as "text" | "richtext" | "boolean",
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="text" className="bg-background">Text</option>
                    <option value="richtext" className="bg-background">Rich Text</option>
                    <option value="boolean" className="bg-background">Boolean</option>
                  </select>
                </div>
              </div>

              {newEntry.content_type === "boolean" ? (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-white/80">
                    {t({ pt: "Valor inicial", en: "Initial value" })}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewEntry((p) => ({
                        ...p,
                        value_pt: p.value_pt === "true" ? "false" : "true",
                        value_en: p.value_en === "true" ? "false" : "true",
                      }))
                    }
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      newEntry.value_en === "true" ? "bg-success" : "bg-white/20"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        newEntry.value_en === "true" ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">
                      {t({ pt: "Valor (PT)", en: "Value (PT)" })}
                    </label>
                    <textarea
                      value={newEntry.value_pt}
                      onChange={(e) => setNewEntry((p) => ({ ...p, value_pt: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={newEntry.content_type === "richtext" ? 4 : 2}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">
                      {t({ pt: "Valor (EN)", en: "Value (EN)" })}
                    </label>
                    <textarea
                      value={newEntry.value_en}
                      onChange={(e) => setNewEntry((p) => ({ ...p, value_en: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={newEntry.content_type === "richtext" ? 4 : 2}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  {t({ pt: "Descrição", en: "Description" })}
                </label>
                <input
                  type="text"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry((p) => ({ ...p, description: e.target.value }))}
                  placeholder={t({ pt: "Opcional...", en: "Optional..." })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleCreate}
                className="w-full py-3 btn-primary rounded-xl font-semibold"
              >
                {t({ pt: "Criar Conteúdo", en: "Create Content" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
