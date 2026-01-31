import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, PlayCircle, Calendar, Package, Search, Eye, EyeOff, Star, Video, ChevronRight, GripVertical } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminAcademyItems, AcademyItem, AcademyItemType } from "@/hooks/useAcademyItems";
import { useAdminCourseLessons, CourseLesson } from "@/hooks/useCourseLessons";
import { AcademyImageUpload } from "@/components/admin/AcademyImageUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<AcademyItemType, { icon: typeof BookOpen; label: string; color: string }> = {
  ebook: { icon: BookOpen, label: "Ebook", color: "bg-blue-500/20 text-blue-300" },
  course: { icon: PlayCircle, label: "Course", color: "bg-purple-500/20 text-purple-300" },
  program: { icon: Calendar, label: "Program", color: "bg-green-500/20 text-green-300" },
  bundle: { icon: Package, label: "Bundle", color: "bg-orange-500/20 text-orange-300" },
};

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

interface ExtendedFormData {
  item_type: AcademyItemType;
  category: string;
  title_pt: string;
  title_en: string;
  subtitle_pt: string | null;
  subtitle_en: string | null;
  description_pt: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  cover_emoji: string | null;
  price: number;
  currency: string;
  original_price: number | null;
  purchase_link: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  duration_label: string | null;
  badge_pt: string | null;
  badge_en: string | null;
  // Course-specific fields
  instructor_name: string;
  total_duration_minutes: number;
  total_lessons: number;
  difficulty_level: string;
  what_you_learn_pt: string[];
  what_you_learn_en: string[];
  video_preview_url: string | null;
}

const EMPTY_ITEM: ExtendedFormData = {
  item_type: "course",
  category: "nutrition",
  title_pt: "",
  title_en: "",
  subtitle_pt: null,
  subtitle_en: null,
  description_pt: null,
  description_en: null,
  cover_image_url: null,
  cover_emoji: "🎓",
  price: 0,
  currency: "EUR",
  original_price: null,
  purchase_link: null,
  is_active: false,
  is_featured: false,
  display_order: 0,
  duration_label: null,
  badge_pt: null,
  badge_en: null,
  instructor_name: "Sara Lucas",
  total_duration_minutes: 0,
  total_lessons: 0,
  difficulty_level: "beginner",
  what_you_learn_pt: [],
  what_you_learn_en: [],
  video_preview_url: null,
};

export default function AdminAcademy() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: items, isLoading, createItem, updateItem, deleteItem, isCreating, isUpdating, isDeleting } = useAdminAcademyItems();
  
  const [editingItem, setEditingItem] = useState<AcademyItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState<ExtendedFormData>(EMPTY_ITEM);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<AcademyItemType | "all">("all");
  const [managingLessonsFor, setManagingLessonsFor] = useState<string | null>(null);

  // What you'll learn input state
  const [newLearnItemPt, setNewLearnItemPt] = useState("");
  const [newLearnItemEn, setNewLearnItemEn] = useState("");

  const filteredItems = items?.filter((item) => {
    const matchesType = filterType === "all" || item.item_type === filterType;
    const matchesSearch = !searchQuery || 
      item.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title_pt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleEdit = (item: AcademyItem) => {
    setEditingItem(item);
    setFormData({
      item_type: item.item_type,
      category: item.category,
      title_pt: item.title_pt,
      title_en: item.title_en,
      subtitle_pt: item.subtitle_pt,
      subtitle_en: item.subtitle_en,
      description_pt: item.description_pt,
      description_en: item.description_en,
      cover_image_url: item.cover_image_url,
      cover_emoji: item.cover_emoji,
      price: item.price,
      currency: item.currency,
      original_price: item.original_price,
      purchase_link: item.purchase_link,
      is_active: item.is_active,
      is_featured: item.is_featured,
      display_order: item.display_order,
      duration_label: item.duration_label,
      badge_pt: item.badge_pt,
      badge_en: item.badge_en,
      instructor_name: item.instructor_name || "Sara Lucas",
      total_duration_minutes: item.total_duration_minutes || 0,
      total_lessons: item.total_lessons || 0,
      difficulty_level: item.difficulty_level || "beginner",
      what_you_learn_pt: item.what_you_learn_pt || [],
      what_you_learn_en: item.what_you_learn_en || [],
      video_preview_url: item.video_preview_url || null,
    });
    setIsCreatingNew(false);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(EMPTY_ITEM);
    setIsCreatingNew(true);
  };

  const handleSave = async () => {
    try {
      if (isCreatingNew) {
        await createItem(formData as any);
        toast.success(t({ pt: "Item criado com sucesso", en: "Item created successfully" }));
      } else if (editingItem) {
        await updateItem({ id: editingItem.id, ...formData } as any);
        toast.success(t({ pt: "Item atualizado com sucesso", en: "Item updated successfully" }));
      }
      setEditingItem(null);
      setIsCreatingNew(false);
    } catch (err) {
      toast.error(t({ pt: "Erro ao guardar", en: "Error saving" }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t({ pt: "Tem certeza que quer apagar?", en: "Are you sure you want to delete?" }))) return;
    try {
      await deleteItem(id);
      toast.success(t({ pt: "Item apagado", en: "Item deleted" }));
    } catch {
      toast.error(t({ pt: "Erro ao apagar", en: "Error deleting" }));
    }
  };

  const handleToggleActive = async (item: AcademyItem) => {
    try {
      await updateItem({ id: item.id, is_active: !item.is_active });
      toast.success(item.is_active 
        ? t({ pt: "Item ocultado", en: "Item hidden" })
        : t({ pt: "Item publicado", en: "Item published" })
      );
    } catch {
      toast.error(t({ pt: "Erro ao atualizar", en: "Error updating" }));
    }
  };

  const handleToggleFeatured = async (item: AcademyItem) => {
    try {
      await updateItem({ id: item.id, is_featured: !item.is_featured });
      toast.success(item.is_featured 
        ? t({ pt: "Removido de destaques", en: "Removed from featured" })
        : t({ pt: "Adicionado aos destaques", en: "Added to featured" })
      );
    } catch {
      toast.error(t({ pt: "Erro ao atualizar", en: "Error updating" }));
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreatingNew(false);
  };

  const addLearnItem = () => {
    if (newLearnItemPt && newLearnItemEn) {
      setFormData({
        ...formData,
        what_you_learn_pt: [...formData.what_you_learn_pt, newLearnItemPt],
        what_you_learn_en: [...formData.what_you_learn_en, newLearnItemEn],
      });
      setNewLearnItemPt("");
      setNewLearnItemEn("");
    }
  };

  const removeLearnItem = (index: number) => {
    setFormData({
      ...formData,
      what_you_learn_pt: formData.what_you_learn_pt.filter((_, i) => i !== index),
      what_you_learn_en: formData.what_you_learn_en.filter((_, i) => i !== index),
    });
  };

  const showForm = editingItem || isCreatingNew;
  const isCourse = formData.item_type === "course";

  // If managing lessons, show that view
  if (managingLessonsFor) {
    return (
      <LessonManager
        courseId={managingLessonsFor}
        courseName={items?.find(i => i.id === managingLessonsFor)?.title_en || "Course"}
        onBack={() => setManagingLessonsFor(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom pb-24">
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
              {t({ pt: "Academia", en: "Academy" })}
            </h1>
            <p className="text-xs text-white/60">
              {t({ pt: "Gerir ebooks, cursos e programas", en: "Manage ebooks, courses and programs" })}
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="result-card p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-white">
            {isCreatingNew 
              ? t({ pt: "Novo Item", en: "New Item" })
              : t({ pt: "Editar Item", en: "Edit Item" })
            }
          </h2>

          {/* Type */}
          <div>
            <label className="text-sm text-white/70 mb-1 block">
              {t({ pt: "Tipo", en: "Type" })}
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["course", "ebook", "program", "bundle"] as AcademyItemType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, item_type: type })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    formData.item_type === type
                      ? "bg-white text-primary-foreground"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  {TYPE_CONFIG[type].label}
                </button>
              ))}
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Título PT</label>
              <Input
                value={formData.title_pt}
                onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                placeholder="Título em português"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Title EN</label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Title in English"
              />
            </div>
          </div>

          {/* Subtitles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Subtítulo PT</label>
              <Input
                value={formData.subtitle_pt || ""}
                onChange={(e) => setFormData({ ...formData, subtitle_pt: e.target.value || null })}
                placeholder="Subtítulo (opcional)"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Subtitle EN</label>
              <Input
                value={formData.subtitle_en || ""}
                onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value || null })}
                placeholder="Subtitle (optional)"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Descrição PT</label>
              <Textarea
                value={formData.description_pt || ""}
                onChange={(e) => setFormData({ ...formData, description_pt: e.target.value || null })}
                placeholder="Descrição do curso..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Description EN</label>
              <Textarea
                value={formData.description_en || ""}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value || null })}
                placeholder="Course description..."
                rows={3}
              />
            </div>
          </div>

          {/* Course-specific fields */}
          {isCourse && (
            <>
              {/* Instructor & Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Instructor</label>
                  <Input
                    value={formData.instructor_name}
                    onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                    placeholder="Sara Lucas"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Difficulty</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration & Lessons */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Total Duration (minutes)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.total_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, total_duration_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-1 block">Total Lessons</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.total_lessons}
                    onChange={(e) => setFormData({ ...formData, total_lessons: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Video Preview URL */}
              <div>
                <label className="text-sm text-white/70 mb-1 block">Video Preview URL</label>
                <Input
                  value={formData.video_preview_url || ""}
                  onChange={(e) => setFormData({ ...formData, video_preview_url: e.target.value || null })}
                  placeholder="https://..."
                />
              </div>

              {/* What you'll learn */}
              <div>
                <label className="text-sm text-white/70 mb-2 block">
                  {t({ pt: "O que vais aprender", en: "What you'll learn" })}
                </label>
                
                {formData.what_you_learn_pt.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.what_you_learn_pt.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                        <span className="text-xs text-white/70 flex-1">{item}</span>
                        <button
                          onClick={() => removeLearnItem(index)}
                          className="p-1 rounded hover:bg-destructive/20 text-destructive/60"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newLearnItemPt}
                    onChange={(e) => setNewLearnItemPt(e.target.value)}
                    placeholder="Item PT"
                    className="text-xs"
                  />
                  <Input
                    value={newLearnItemEn}
                    onChange={(e) => setNewLearnItemEn(e.target.value)}
                    placeholder="Item EN"
                    className="text-xs"
                  />
                </div>
                <button
                  onClick={addLearnItem}
                  disabled={!newLearnItemPt || !newLearnItemEn}
                  className="mt-2 text-xs text-white/60 hover:text-white disabled:opacity-50"
                >
                  + Add item
                </button>
              </div>
            </>
          )}

          {/* Price & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">
                {t({ pt: "Preço", en: "Price" })}
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">
                {t({ pt: "Moeda", en: "Currency" })}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
                <option value="GBP">GBP £</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">
                {t({ pt: "Preço Original", en: "Original Price" })}
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.original_price || ""}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="For discounts"
              />
            </div>
          </div>

          {/* Purchase Link */}
          <div>
            <label className="text-sm text-white/70 mb-1 block">
              {t({ pt: "Link de Compra", en: "Purchase Link" })}
            </label>
            <Input
              value={formData.purchase_link || ""}
              onChange={(e) => setFormData({ ...formData, purchase_link: e.target.value || null })}
              placeholder="https://..."
            />
          </div>

          {/* Cover Image Upload */}
          <AcademyImageUpload
            currentImageUrl={formData.cover_image_url}
            currentEmoji={formData.cover_emoji}
            onImageChange={(url) => setFormData({ ...formData, cover_image_url: url })}
            onEmojiChange={(emoji) => setFormData({ ...formData, cover_emoji: emoji })}
            type={isCourse ? "course" : "course"}
          />

          {/* Display Order */}
          <div>
            <label className="text-sm text-white/70 mb-1 block">
              {t({ pt: "Ordem de Exibição", en: "Display Order" })}
            </label>
            <Input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-white/80">
                {t({ pt: "Publicado", en: "Published" })}
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-white/80">
                {t({ pt: "Em Destaque", en: "Featured" })}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 btn-secondary rounded-xl"
            >
              {t({ pt: "Cancelar", en: "Cancel" })}
            </button>
            <button
              onClick={handleSave}
              disabled={isCreating || isUpdating || !formData.title_en || !formData.title_pt}
              className="flex-1 py-2.5 btn-primary rounded-xl disabled:opacity-50"
            >
              {isCreating || isUpdating
                ? t({ pt: "A guardar...", en: "Saving..." })
                : t({ pt: "Guardar", en: "Save" })
              }
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {!showForm && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder={t({ pt: "Pesquisar...", en: "Search..." })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {(["all", "course", "ebook", "program", "bundle"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  filterType === type
                    ? "bg-white text-primary-foreground"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                )}
              >
                {type === "all" ? t({ pt: "Todos", en: "All" }) : TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Items List */}
      {!showForm && (
        <div className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </>
          ) : filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const config = TYPE_CONFIG[item.item_type];
              const Icon = config.icon;
              const title = language === "pt" ? item.title_pt : item.title_en;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "result-card p-4 flex items-center gap-3",
                    !item.is_active && "opacity-60"
                  )}
                >
                  <div className={cn("p-2 rounded-xl", config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">{title}</h3>
                      {item.is_featured && (
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                      )}
                    </div>
                    <p className="text-xs text-white/60">
                      €{item.price.toFixed(2)} · {item.is_active ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Manage Lessons (for courses) */}
                    {item.item_type === "course" && (
                      <button
                        onClick={() => setManagingLessonsFor(item.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60"
                        title="Manage Lessons"
                      >
                        <Video className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        item.is_featured ? "bg-warning/20 text-warning" : "hover:bg-white/10 text-white/40"
                      )}
                      title={item.is_featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60"
                      title={item.is_active ? "Hide" : "Publish"}
                    >
                      {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                      className="p-2 rounded-lg hover:bg-destructive/20 text-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">
                {t({ pt: "Nenhum item encontrado", en: "No items found" })}
              </p>
              <button
                onClick={handleCreate}
                className="mt-4 btn-primary px-6 py-2 rounded-xl"
              >
                {t({ pt: "Criar Primeiro Item", en: "Create First Item" })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Lesson Manager Component
function LessonManager({ courseId, courseName, onBack }: { courseId: string; courseName: string; onBack: () => void }) {
  const { t } = useLanguage();
  const { data: lessons, isLoading, createLesson, updateLesson, deleteLesson, isCreating, isUpdating } = useAdminCourseLessons(courseId);
  
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    title_pt: "",
    title_en: "",
    description_pt: "",
    description_en: "",
    video_url: "",
    thumbnail_url: "",
    duration_seconds: 0,
    display_order: 0,
    is_preview: false,
    is_active: true,
  });

  const handleCreate = () => {
    setEditingLesson(null);
    setFormData({
      title_pt: "",
      title_en: "",
      description_pt: "",
      description_en: "",
      video_url: "",
      thumbnail_url: "",
      duration_seconds: 0,
      display_order: lessons?.length || 0,
      is_preview: false,
      is_active: true,
    });
    setIsCreatingNew(true);
  };

  const handleEdit = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setFormData({
      title_pt: lesson.title_pt,
      title_en: lesson.title_en,
      description_pt: lesson.description_pt || "",
      description_en: lesson.description_en || "",
      video_url: lesson.video_url || "",
      thumbnail_url: lesson.thumbnail_url || "",
      duration_seconds: lesson.duration_seconds,
      display_order: lesson.display_order,
      is_preview: lesson.is_preview,
      is_active: lesson.is_active,
    });
    setIsCreatingNew(false);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        course_id: courseId,
        description_pt: formData.description_pt || null,
        description_en: formData.description_en || null,
        video_url: formData.video_url || null,
        thumbnail_url: formData.thumbnail_url || null,
      };

      if (isCreatingNew) {
        await createLesson(data as any);
        toast.success(t({ pt: "Aula criada", en: "Lesson created" }));
      } else if (editingLesson) {
        await updateLesson({ id: editingLesson.id, ...data } as any);
        toast.success(t({ pt: "Aula atualizada", en: "Lesson updated" }));
      }
      setEditingLesson(null);
      setIsCreatingNew(false);
    } catch {
      toast.error(t({ pt: "Erro ao guardar", en: "Error saving" }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t({ pt: "Apagar esta aula?", en: "Delete this lesson?" }))) return;
    try {
      await deleteLesson(id);
      toast.success(t({ pt: "Aula apagada", en: "Lesson deleted" }));
    } catch {
      toast.error(t({ pt: "Erro ao apagar", en: "Error deleting" }));
    }
  };

  const showForm = editingLesson || isCreatingNew;

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {t({ pt: "Aulas", en: "Lessons" })}
            </h1>
            <p className="text-xs text-white/60">{courseName}</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={handleCreate} className="p-2 rounded-xl bg-primary text-primary-foreground">
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="result-card p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-white">
            {isCreatingNew ? t({ pt: "Nova Aula", en: "New Lesson" }) : t({ pt: "Editar Aula", en: "Edit Lesson" })}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Título PT</label>
              <Input
                value={formData.title_pt}
                onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Title EN</label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1 block">Video URL</label>
            <Input
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Duration (seconds)</label>
              <Input
                type="number"
                min="0"
                value={formData.duration_seconds}
                onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1 block">Order</label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_preview}
                onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-white/80">Free Preview</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-white/80">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setEditingLesson(null); setIsCreatingNew(false); }}
              className="flex-1 py-2.5 btn-secondary rounded-xl"
            >
              {t({ pt: "Cancelar", en: "Cancel" })}
            </button>
            <button
              onClick={handleSave}
              disabled={isCreating || isUpdating || !formData.title_en || !formData.title_pt}
              className="flex-1 py-2.5 btn-primary rounded-xl disabled:opacity-50"
            >
              {t({ pt: "Guardar", en: "Save" })}
            </button>
          </div>
        </div>
      )}

      {/* Lessons List */}
      {!showForm && (
        <div className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-16 rounded-2xl" />
          ) : lessons && lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <div key={lesson.id} className="result-card p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/70">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">{lesson.title_en}</h3>
                  <p className="text-xs text-white/50">
                    {Math.floor(lesson.duration_seconds / 60)}m
                    {lesson.is_preview && " · Preview"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(lesson)} className="p-2 rounded-lg hover:bg-white/10 text-white/60">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(lesson.id)} className="p-2 rounded-lg hover:bg-destructive/20 text-destructive/60">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">{t({ pt: "Sem aulas ainda", en: "No lessons yet" })}</p>
              <button onClick={handleCreate} className="mt-4 btn-primary px-6 py-2 rounded-xl">
                {t({ pt: "Adicionar Primeira Aula", en: "Add First Lesson" })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
