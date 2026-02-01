import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Star,
  Eye,
  EyeOff,
  MessageSquareQuote,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  useTestimonials,
  useTestimonialMutations,
  Testimonial,
  TestimonialInsert,
} from "@/hooks/useTestimonials";
import { useAcademyItems } from "@/hooks/useAcademyItems";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { TestimonialPhotoUpload } from "@/components/admin/TestimonialPhotoUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "general", labelPt: "Geral", labelEn: "General" },
  { value: "training", labelPt: "Treino", labelEn: "Training" },
  { value: "nutrition", labelPt: "Nutrição", labelEn: "Nutrition" },
  { value: "course", labelPt: "Curso", labelEn: "Course" },
  { value: "consultation", labelPt: "Consulta", labelEn: "Consultation" },
];

type FormData = {
  name: string;
  text_pt: string;
  text_en: string;
  photo_url: string | null;
  category: string;
  rating: number | null;
  linked_product_id: string | null;
  is_active: boolean;
  show_on_homepage: boolean;
  show_on_academy: boolean;
};

const INITIAL_FORM: FormData = {
  name: "",
  text_pt: "",
  text_en: "",
  photo_url: null,
  category: "general",
  rating: 5,
  linked_product_id: null,
  is_active: true,
  show_on_homepage: false,
  show_on_academy: true,
};

export default function AdminTestimonials() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: testimonials, isLoading } = useTestimonials({ includeInactive: true });
  const { data: products } = useAcademyItems();
  const { createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials } =
    useTestimonialMutations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name,
      text_pt: testimonial.text_pt,
      text_en: testimonial.text_en,
      photo_url: testimonial.photo_url,
      category: testimonial.category,
      rating: testimonial.rating,
      linked_product_id: testimonial.linked_product_id,
      is_active: testimonial.is_active,
      show_on_homepage: testimonial.show_on_homepage,
      show_on_academy: testimonial.show_on_academy,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTestimonial.mutateAsync(deletingId);
      toast.success(t({ pt: "Testemunho eliminado", en: "Testimonial deleted" }));
    } catch {
      toast.error(t({ pt: "Erro ao eliminar", en: "Failed to delete" }));
    } finally {
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.text_pt.trim() || !form.text_en.trim()) {
      toast.error(t({ pt: "Preencha todos os campos obrigatórios", en: "Fill all required fields" }));
      return;
    }

    try {
      if (editingId) {
        await updateTestimonial.mutateAsync({
          id: editingId,
          updates: form,
        });
        toast.success(t({ pt: "Testemunho atualizado", en: "Testimonial updated" }));
      } else {
        const newTestimonial: TestimonialInsert = {
          ...form,
          display_order: testimonials?.length || 0,
        };
        await createTestimonial.mutateAsync(newTestimonial);
        toast.success(t({ pt: "Testemunho criado", en: "Testimonial created" }));
      }
      setIsFormOpen(false);
    } catch {
      toast.error(t({ pt: "Erro ao guardar", en: "Failed to save" }));
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !testimonials) return;

    const draggedIndex = testimonials.findIndex((t) => t.id === draggedId);
    const targetIndex = testimonials.findIndex((t) => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...testimonials];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Update order immediately for visual feedback
    reorderTestimonials.mutate(newOrder.map((t) => t.id));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      await updateTestimonial.mutateAsync({
        id: testimonial.id,
        updates: { is_active: !testimonial.is_active },
      });
    } catch {
      toast.error(t({ pt: "Erro ao atualizar", en: "Failed to update" }));
    }
  };

  return (
    <AdminAuthGuard>
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
                {t({ pt: "Testemunhos", en: "Testimonials" })}
              </h1>
              <p className="text-xs text-white/60">
                {t({ pt: "Gerir testemunhos de clientes", en: "Manage customer testimonials" })}
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            {t({ pt: "Adicionar", en: "Add" })}
          </Button>
        </div>

        {/* Testimonials List */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </>
          ) : testimonials?.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquareQuote className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">
                {t({ pt: "Nenhum testemunho ainda", en: "No testimonials yet" })}
              </p>
            </div>
          ) : (
            testimonials?.map((testimonial) => (
              <div
                key={testimonial.id}
                draggable
                onDragStart={() => handleDragStart(testimonial.id)}
                onDragOver={(e) => handleDragOver(e, testimonial.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "result-card p-4 flex items-start gap-3 cursor-grab active:cursor-grabbing transition-all",
                  draggedId === testimonial.id && "opacity-50 scale-95",
                  !testimonial.is_active && "opacity-60"
                )}
              >
                <GripVertical className="h-5 w-5 text-white/30 flex-shrink-0 mt-1" />

                {testimonial.photo_url ? (
                  <img
                    src={testimonial.photo_url}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(340_50%_60%)] to-[hsl(30_50%_60%)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white truncate">
                      {testimonial.name}
                    </span>
                    {testimonial.rating && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-[hsl(45_90%_60%)] text-[hsl(45_90%_60%)]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">
                    {language === "pt" ? testimonial.text_pt : testimonial.text_en}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                      {CATEGORIES.find((c) => c.value === testimonial.category)?.[
                        language === "pt" ? "labelPt" : "labelEn"
                      ] || testimonial.category}
                    </span>
                    {testimonial.show_on_homepage && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        Homepage
                      </span>
                    )}
                    {testimonial.show_on_academy && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        Academy
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(testimonial)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title={testimonial.is_active ? "Desativar" : "Ativar"}
                  >
                    {testimonial.is_active ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-white/40" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400/60" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[hsl(340_30%_12%)] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId
                  ? t({ pt: "Editar Testemunho", en: "Edit Testimonial" })
                  : t({ pt: "Novo Testemunho", en: "New Testimonial" })}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Photo Upload */}
              <TestimonialPhotoUpload
                currentUrl={form.photo_url}
                onUpload={(url) => setForm({ ...form, photo_url: url })}
                onRemove={() => setForm({ ...form, photo_url: null })}
              />

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">
                  {t({ pt: "Nome *", en: "Name *" })}
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Maria Silva"
                  className="bg-white/5 border-white/10"
                />
              </div>

              {/* Text PT */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">
                  {t({ pt: "Testemunho (PT) *", en: "Testimonial (PT) *" })}
                </label>
                <Textarea
                  value={form.text_pt}
                  onChange={(e) => setForm({ ...form, text_pt: e.target.value })}
                  placeholder="O programa mudou a minha vida..."
                  rows={3}
                  className="bg-white/5 border-white/10 resize-none"
                />
              </div>

              {/* Text EN */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">
                  {t({ pt: "Testemunho (EN) *", en: "Testimonial (EN) *" })}
                </label>
                <Textarea
                  value={form.text_en}
                  onChange={(e) => setForm({ ...form, text_en: e.target.value })}
                  placeholder="The program changed my life..."
                  rows={3}
                  className="bg-white/5 border-white/10 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">
                  {t({ pt: "Categoria", en: "Category" })}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {language === "pt" ? cat.labelPt : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">
                  {t({ pt: "Avaliação", en: "Rating" })}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, rating: form.rating === star ? null : star })
                      }
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition-colors",
                          form.rating && star <= form.rating
                            ? "fill-[hsl(45_90%_60%)] text-[hsl(45_90%_60%)]"
                            : "text-white/20"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked Product */}
              <div>
                <label className="text-sm font-medium text-white/80 mb-1 block">
                  {t({ pt: "Produto associado (opcional)", en: "Linked product (optional)" })}
                </label>
                <select
                  value={form.linked_product_id || ""}
                  onChange={(e) =>
                    setForm({ ...form, linked_product_id: e.target.value || null })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="">
                    {t({ pt: "Nenhum (geral)", en: "None (general)" })}
                  </option>
                  {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {language === "pt" ? product.title_pt : product.title_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">
                    {t({ pt: "Ativo", en: "Active" })}
                  </label>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">
                    {t({ pt: "Mostrar na Homepage", en: "Show on Homepage" })}
                  </label>
                  <Switch
                    checked={form.show_on_homepage}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, show_on_homepage: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">
                    {t({ pt: "Mostrar na Academy", en: "Show on Academy" })}
                  </label>
                  <Switch
                    checked={form.show_on_academy}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, show_on_academy: checked })
                    }
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={createTestimonial.isPending || updateTestimonial.isPending}
              >
                {(createTestimonial.isPending || updateTestimonial.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingId
                  ? t({ pt: "Guardar Alterações", en: "Save Changes" })
                  : t({ pt: "Criar Testemunho", en: "Create Testimonial" })}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-[hsl(340_30%_12%)] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                {t({ pt: "Eliminar Testemunho?", en: "Delete Testimonial?" })}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                {t({
                  pt: "Esta ação não pode ser revertida.",
                  en: "This action cannot be undone.",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/20">
                {t({ pt: "Cancelar", en: "Cancel" })}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                {t({ pt: "Eliminar", en: "Delete" })}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminAuthGuard>
  );
}
