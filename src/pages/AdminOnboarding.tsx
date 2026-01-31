import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  Camera,
  GraduationCap,
  MessageCircle,
  Dumbbell,
  UtensilsCrossed,
  HeartHandshake,
  Sparkles,
  BookOpen,
  Play,
  ShoppingBag,
  type LucideIcon
} from "lucide-react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminOnboardingSlides, type OnboardingSlide } from "@/hooks/useOnboardingSlides";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/hooks/use-toast";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  "camera": Camera,
  "graduation-cap": GraduationCap,
  "message-circle": MessageCircle,
  "dumbbell": Dumbbell,
  "utensils": UtensilsCrossed,
  "heart-handshake": HeartHandshake,
  "sparkles": Sparkles,
  "book-open": BookOpen,
  "play": Play,
  "shopping-bag": ShoppingBag,
};

const AVAILABLE_ICONS = [
  { value: "camera", label: "Camera" },
  { value: "graduation-cap", label: "Graduation Cap" },
  { value: "message-circle", label: "Message Circle" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "utensils", label: "Utensils" },
  { value: "heart-handshake", label: "Heart Handshake" },
  { value: "sparkles", label: "Sparkles" },
  { value: "book-open", label: "Book Open" },
  { value: "play", label: "Play" },
  { value: "shopping-bag", label: "Shopping Bag" },
];

type SlideFormData = {
  icon: string;
  title_pt: string;
  title_en: string;
  text_pt: string;
  text_en: string;
  is_active: boolean;
};

const emptyFormData: SlideFormData = {
  icon: "sparkles",
  title_pt: "",
  title_en: "",
  text_pt: "",
  text_en: "",
  is_active: true,
};

function AdminOnboardingContent() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { 
    slides, 
    isLoading, 
    createSlide, 
    updateSlide, 
    deleteSlide, 
    reorderSlides 
  } = useAdminOnboardingSlides();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<OnboardingSlide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingSlide(null);
    setFormData({
      ...emptyFormData,
      icon: "sparkles",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (slide: OnboardingSlide) => {
    setEditingSlide(slide);
    setFormData({
      icon: slide.icon,
      title_pt: slide.title_pt,
      title_en: slide.title_en,
      text_pt: slide.text_pt,
      text_en: slide.text_en,
      is_active: slide.is_active,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title_pt || !formData.title_en || !formData.text_pt || !formData.text_en) {
      toast({
        title: t({ pt: "Erro", en: "Error" }),
        description: t({ pt: "Preencha todos os campos", en: "Fill in all fields" }),
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSlide) {
        await updateSlide.mutateAsync({
          id: editingSlide.id,
          ...formData,
        });
        toast({
          title: t({ pt: "Slide atualizado", en: "Slide updated" }),
        });
      } else {
        const maxOrder = slides.length > 0 
          ? Math.max(...slides.map(s => s.display_order)) + 1 
          : 0;
        await createSlide.mutateAsync({
          ...formData,
          display_order: maxOrder,
        });
        toast({
          title: t({ pt: "Slide criado", en: "Slide created" }),
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: t({ pt: "Erro ao guardar", en: "Error saving" }),
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (slide: OnboardingSlide) => {
    try {
      await updateSlide.mutateAsync({
        id: slide.id,
        is_active: !slide.is_active,
      });
      toast({
        title: slide.is_active 
          ? t({ pt: "Slide desativado", en: "Slide deactivated" })
          : t({ pt: "Slide ativado", en: "Slide activated" }),
      });
    } catch (error) {
      toast({
        title: t({ pt: "Erro", en: "Error" }),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSlide.mutateAsync(id);
      setDeleteConfirm(null);
      toast({
        title: t({ pt: "Slide eliminado", en: "Slide deleted" }),
      });
    } catch (error) {
      toast({
        title: t({ pt: "Erro ao eliminar", en: "Error deleting" }),
        variant: "destructive",
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, slideId: string) => {
    setDraggedId(slideId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentOrder = slides.map(s => s.id);
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);

    // Reorder array
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    try {
      await reorderSlides.mutateAsync(newOrder);
      toast({
        title: t({ pt: "Ordem atualizada", en: "Order updated" }),
      });
    } catch (error) {
      toast({
        title: t({ pt: "Erro ao reordenar", en: "Error reordering" }),
        variant: "destructive",
      });
    }

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const getSlideTitle = (slide: OnboardingSlide) => {
    return language === "pt" ? slide.title_pt : slide.title_en;
  };

  const getSlideText = (slide: OnboardingSlide) => {
    return language === "pt" ? slide.text_pt : slide.text_en;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-5 pb-24 safe-top safe-bottom">
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
              {t({ pt: "Onboarding", en: "Onboarding" })}
            </h1>
            <p className="text-xs text-white/60">
              {t({ pt: "Gerir slides de boas-vindas", en: "Manage welcome slides" })}
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {t({ pt: "Adicionar", en: "Add" })}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/70">
          {t({
            pt: "Arraste os slides para reordenar. As alterações são aplicadas imediatamente.",
            en: "Drag slides to reorder. Changes are applied immediately.",
          })}
        </p>
      </div>

      {/* Slides List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">
            {t({ pt: "Nenhum slide configurado", en: "No slides configured" })}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {slides.map((slide, index) => {
            const IconComponent = ICON_MAP[slide.icon] || Sparkles;
            return (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleDragStart(e, slide.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slide.id)}
                onDragEnd={handleDragEnd}
                className={`
                  result-card p-4 flex items-center gap-3 cursor-grab active:cursor-grabbing
                  ${draggedId === slide.id ? "opacity-50" : ""}
                  ${!slide.is_active ? "opacity-60" : ""}
                `}
              >
                {/* Drag Handle */}
                <div className="text-white/30 hover:text-white/60 transition-colors">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Order Number */}
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {getSlideTitle(slide)}
                  </h3>
                  <p className="text-xs text-white/50 truncate">
                    {getSlideText(slide)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title={slide.is_active 
                      ? t({ pt: "Desativar", en: "Deactivate" })
                      : t({ pt: "Ativar", en: "Activate" })
                    }
                  >
                    {slide.is_active ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-white/40" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(slide)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-white/60" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm(slide.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400/60" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSlide
                ? t({ pt: "Editar Slide", en: "Edit Slide" })
                : t({ pt: "Novo Slide", en: "New Slide" })
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Icon Picker */}
            <div className="space-y-2">
              <Label className="text-white/70">
                {t({ pt: "Ícone", en: "Icon" })}
              </Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => {
                    const IconComp = ICON_MAP[icon.value];
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          {icon.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Title PT */}
            <div className="space-y-2">
              <Label className="text-white/70">
                {t({ pt: "Título (PT)", en: "Title (PT)" })}
              </Label>
              <Input
                value={formData.title_pt}
                onChange={(e) => setFormData(prev => ({ ...prev, title_pt: e.target.value }))}
                placeholder="Título em português..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Title EN */}
            <div className="space-y-2">
              <Label className="text-white/70">
                {t({ pt: "Título (EN)", en: "Title (EN)" })}
              </Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                placeholder="Title in English..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Text PT */}
            <div className="space-y-2">
              <Label className="text-white/70">
                {t({ pt: "Descrição (PT)", en: "Description (PT)" })}
              </Label>
              <Textarea
                value={formData.text_pt}
                onChange={(e) => setFormData(prev => ({ ...prev, text_pt: e.target.value }))}
                placeholder="Descrição em português..."
                className="bg-white/5 border-white/10 text-white resize-none"
                rows={2}
              />
            </div>

            {/* Text EN */}
            <div className="space-y-2">
              <Label className="text-white/70">
                {t({ pt: "Descrição (EN)", en: "Description (EN)" })}
              </Label>
              <Textarea
                value={formData.text_en}
                onChange={(e) => setFormData(prev => ({ ...prev, text_en: e.target.value }))}
                placeholder="Description in English..."
                className="bg-white/5 border-white/10 text-white resize-none"
                rows={2}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-white/70">
                {t({ pt: "Ativo", en: "Active" })}
              </Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsFormOpen(false)}
            >
              {t({ pt: "Cancelar", en: "Cancel" })}
            </Button>
            <Button
              onClick={handleSave}
              disabled={createSlide.isPending || updateSlide.isPending}
            >
              {t({ pt: "Guardar", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-background border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {t({ pt: "Eliminar Slide?", en: "Delete Slide?" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t({
                pt: "Esta ação não pode ser revertida. O slide será permanentemente eliminado.",
                en: "This action cannot be undone. The slide will be permanently deleted.",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t({ pt: "Cancelar", en: "Cancel" })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-500 hover:bg-red-600"
            >
              {t({ pt: "Eliminar", en: "Delete" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminOnboarding() {
  return (
    <AdminAuthGuard>
      <AdminOnboardingContent />
    </AdminAuthGuard>
  );
}
