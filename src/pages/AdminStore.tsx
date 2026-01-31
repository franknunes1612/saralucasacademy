import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useStoreItems, useCreateStoreItem, useUpdateStoreItem, useDeleteStoreItem, type StoreItem, type StoreItemInsert } from "@/hooks/useStoreItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";

const CATEGORY_OPTIONS = [
  { value: "supplement", label: { pt: "Suplemento", en: "Supplement" } },
  { value: "kitchen", label: { pt: "Cozinha", en: "Kitchen" } },
  { value: "fitness", label: { pt: "Fitness", en: "Fitness" } },
  { value: "plan", label: { pt: "Plano", en: "Plan" } },
  { value: "training", label: { pt: "Treino", en: "Training" } },
  { value: "recipe_pack", label: { pt: "Pack Receitas", en: "Recipe Pack" } },
  { value: "bundle", label: { pt: "Bundle", en: "Bundle" } },
  { value: "service", label: { pt: "Serviço", en: "Service" } },
];

export default function AdminStore() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: items, isLoading } = useStoreItems(true);
  const createItem = useCreateStoreItem();
  const updateItem = useUpdateStoreItem();
  const deleteItem = useDeleteStoreItem();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [formData, setFormData] = useState<Partial<StoreItemInsert>>({
    name_pt: "",
    name_en: "",
    description_pt: "",
    description_en: "",
    brand: "",
    price: 0,
    currency: "EUR",
    category: "supplement",
    purchase_type: "external_link",
    purchase_link: "",
    image_emoji: "📦",
    image_url: null,
    rating: null,
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name_pt: "",
      name_en: "",
      description_pt: "",
      description_en: "",
      brand: "",
      price: 0,
      currency: "EUR",
      category: "supplement",
      purchase_type: "external_link",
      purchase_link: "",
      image_emoji: "📦",
      image_url: null,
      rating: null,
      is_active: true,
      display_order: items?.length || 0,
    });
    setEditingItem(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: StoreItem) => {
    setEditingItem(item);
    setFormData({
      name_pt: item.name_pt,
      name_en: item.name_en,
      description_pt: item.description_pt || "",
      description_en: item.description_en || "",
      brand: item.brand || "",
      price: item.price,
      currency: item.currency,
      category: item.category,
      purchase_type: item.purchase_type,
      purchase_link: item.purchase_link || "",
      image_emoji: item.image_emoji || "📦",
      image_url: item.image_url || null,
      rating: item.rating,
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_pt || !formData.name_en || !formData.category) {
      toast.error(t({ pt: "Preencha os campos obrigatórios", en: "Fill required fields" }));
      return;
    }

    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...formData as StoreItemInsert });
        toast.success(t({ pt: "Produto atualizado", en: "Product updated" }));
      } else {
        await createItem.mutateAsync(formData as StoreItemInsert);
        toast.success(t({ pt: "Produto criado", en: "Product created" }));
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t({ pt: "Erro ao guardar", en: "Error saving" }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t({ pt: "Eliminar este produto?", en: "Delete this product?" }))) return;
    try {
      await deleteItem.mutateAsync(id);
      toast.success(t({ pt: "Produto eliminado", en: "Product deleted" }));
    } catch (error) {
      toast.error(t({ pt: "Erro ao eliminar", en: "Error deleting" }));
    }
  };

  const toggleActive = async (item: StoreItem) => {
    try {
      await updateItem.mutateAsync({ id: item.id, is_active: !item.is_active });
      toast.success(item.is_active 
        ? t({ pt: "Produto desativado", en: "Product deactivated" })
        : t({ pt: "Produto ativado", en: "Product activated" })
      );
    } catch (error) {
      toast.error(t({ pt: "Erro ao atualizar", en: "Error updating" }));
    }
  };

  const getCategoryLabel = (value: string) => {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === value);
    return cat ? (language === "pt" ? cat.label.pt : cat.label.en) : value;
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
              {t({ pt: "Loja / Produtos", en: "Store / Products" })}
            </h1>
            <p className="text-xs text-white/60">
              {t({ pt: "Gerir produtos e links de afiliados", en: "Manage products and affiliate links" })}
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          {t({ pt: "Novo", en: "New" })}
        </Button>
      </div>

      {/* Items list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="result-card p-4 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">{t({ pt: "Sem produtos", en: "No products yet" })}</p>
          <Button onClick={openCreateDialog} variant="outline" className="mt-4">
            {t({ pt: "Criar primeiro produto", en: "Create first product" })}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => (
            <div
              key={item.id}
              className={`result-card p-4 ${!item.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    item.image_emoji || "📦"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-white truncate">
                      {language === "pt" ? item.name_pt : item.name_en}
                    </h3>
                    {!item.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                        {t({ pt: "Inativo", en: "Inactive" })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">{item.brand}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-white">
                      €{Number(item.price).toFixed(2)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {item.purchase_link && (
                    <a
                      href={item.purchase_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-white/40" />
                    </a>
                  )}
                  <button
                    onClick={() => toggleActive(item)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {item.is_active ? (
                      <Eye className="h-4 w-4 text-white/60" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-white/40" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditDialog(item)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive/70" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? t({ pt: "Editar Produto", en: "Edit Product" })
                : t({ pt: "Novo Produto", en: "New Product" })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Nome (PT) *</label>
                <Input
                  value={formData.name_pt}
                  onChange={(e) => setFormData({ ...formData, name_pt: e.target.value })}
                  placeholder="Proteína Orgânica"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Name (EN) *</label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Organic Protein"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Descrição (PT)</label>
                <Textarea
                  value={formData.description_pt || ""}
                  onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                  placeholder="Proteína vegetal com 25g por dose..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Description (EN)</label>
                <Textarea
                  value={formData.description_en || ""}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Plant-based protein with 25g per serving..."
                  rows={3}
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Marca", en: "Brand" })}</label>
              <Input
                value={formData.brand || ""}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="NutriPure"
              />
            </div>

            {/* Image Upload */}
            <ProductImageUpload
              currentImageUrl={formData.image_url || null}
              currentEmoji={formData.image_emoji || "📦"}
              onImageChange={(url) => setFormData({ ...formData, image_url: url })}
              onEmojiChange={(emoji) => setFormData({ ...formData, image_emoji: emoji })}
            />

            {/* Price, Currency, Category */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Preço", en: "Price" })}</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Moeda", en: "Currency" })}</label>
                <Select
                  value={formData.currency}
                  onValueChange={(v) => setFormData({ ...formData, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Categoria", en: "Category" })} *</label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === "pt" ? cat.label.pt : cat.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Purchase type & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Tipo de compra", en: "Purchase type" })}</label>
                <Select
                  value={formData.purchase_type}
                  onValueChange={(v) => setFormData({ ...formData, purchase_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external_link">{t({ pt: "Link externo", en: "External link" })}</SelectItem>
                    <SelectItem value="internal">{t({ pt: "Interno", en: "Internal" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Rating (1-5)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating || ""}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || null })}
                  placeholder="4.5"
                />
              </div>
            </div>

            {/* Purchase link */}
            <div>
              <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Link de compra", en: "Purchase link" })}</label>
              <Input
                value={formData.purchase_link || ""}
                onChange={(e) => setFormData({ ...formData, purchase_link: e.target.value })}
                placeholder="https://www.amazon.com/..."
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/80">{t({ pt: "Ativo", en: "Active" })}</label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t({ pt: "Cancelar", en: "Cancel" })}
            </Button>
            <Button onClick={handleSave} disabled={createItem.isPending || updateItem.isPending}>
              {t({ pt: "Guardar", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
