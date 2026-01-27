import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { useRecommendedProducts, useRecommendedProductMutations, type RecommendedProduct } from "@/hooks/useRecommendedProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { value: "supplement", label: "Suplemento" },
  { value: "equipment", label: "Equipamento" },
  { value: "food", label: "Alimento" },
  { value: "kitchen", label: "Cozinha" },
  { value: "fitness", label: "Fitness" },
  { value: "other", label: "Outro" },
];

const EMOJI_OPTIONS = ["📦", "🥛", "💪", "⚖️", "🍶", "🌾", "🥗", "🍎", "🏋️", "🎯"];

type ProductFormData = Omit<RecommendedProduct, "id" | "created_at" | "updated_at">;

const emptyForm: ProductFormData = {
  name_pt: "",
  name_en: "",
  description_pt: "",
  description_en: "",
  image_url: null,
  image_emoji: "📦",
  external_link: "",
  category: "supplement",
  brand: "",
  is_active: true,
  display_order: 0,
};

function ProductForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing,
}: {
  form: ProductFormData;
  setForm: (form: ProductFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/60 mb-1 block">Nome (PT)</label>
          <Input
            value={form.name_pt}
            onChange={(e) => setForm({ ...form, name_pt: e.target.value })}
            placeholder="Proteína Whey"
            className="bg-white/5 border-white/10"
          />
        </div>
        <div>
          <label className="text-xs text-white/60 mb-1 block">Nome (EN)</label>
          <Input
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            placeholder="Whey Protein"
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/60 mb-1 block">Descrição (PT)</label>
          <Textarea
            value={form.description_pt || ""}
            onChange={(e) => setForm({ ...form, description_pt: e.target.value })}
            placeholder="Descrição do produto..."
            className="bg-white/5 border-white/10 min-h-[80px]"
          />
        </div>
        <div>
          <label className="text-xs text-white/60 mb-1 block">Descrição (EN)</label>
          <Textarea
            value={form.description_en || ""}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            placeholder="Product description..."
            className="bg-white/5 border-white/10 min-h-[80px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/60 mb-1 block">Marca</label>
          <Input
            value={form.brand || ""}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="Optimum Nutrition"
            className="bg-white/5 border-white/10"
          />
        </div>
        <div>
          <label className="text-xs text-white/60 mb-1 block">Categoria</label>
          <Select
            value={form.category}
            onValueChange={(value) => setForm({ ...form, category: value })}
          >
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/60 mb-1 block">Link Externo</label>
        <Input
          value={form.external_link || ""}
          onChange={(e) => setForm({ ...form, external_link: e.target.value })}
          placeholder="https://amazon.com/produto"
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/60 mb-1 block">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setForm({ ...form, image_emoji: emoji })}
                className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                  form.image_emoji === emoji
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-white/60 mb-1 block">Ordem</label>
          <Input
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={onSubmit} className="flex-1">
          {isEditing ? "Guardar" : "Criar Produto"}
        </Button>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  product: RecommendedProduct;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className={`result-card p-4 ${!product.is_active ? "opacity-50" : ""}`}>
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
          {product.image_emoji || "📦"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-white truncate">{product.name_pt}</h3>
              <p className="text-xs text-white/50">{product.brand || "Sem marca"}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={onToggleActive}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title={product.is_active ? "Desativar" : "Ativar"}
              >
                {product.is_active ? (
                  <Eye className="h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="h-4 w-4 text-white/40" />
                )}
              </button>
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Pencil className="h-4 w-4 text-white/60" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
          <p className="text-xs text-white/60 line-clamp-1 mt-1">
            {product.description_pt || "Sem descrição"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">
              {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
            </span>
            {product.external_link && (
              <a
                href={product.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary flex items-center gap-0.5"
              >
                <ExternalLink className="h-3 w-3" />
                Link
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminRecommendedProducts() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useRecommendedProducts(true);
  const { createProduct, updateProduct, deleteProduct } = useRecommendedProductMutations();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RecommendedProduct | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const handleCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const handleEdit = (product: RecommendedProduct) => {
    setEditingProduct(product);
    setForm({
      name_pt: product.name_pt,
      name_en: product.name_en,
      description_pt: product.description_pt,
      description_en: product.description_en,
      image_url: product.image_url,
      image_emoji: product.image_emoji,
      external_link: product.external_link,
      category: product.category,
      brand: product.brand,
      is_active: product.is_active,
      display_order: product.display_order,
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.name_pt || !form.name_en) {
      toast.error("Nome é obrigatório em ambos os idiomas");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...form });
        toast.success("Produto atualizado!");
      } else {
        await createProduct.mutateAsync(form);
        toast.success("Produto criado!");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error("Erro ao guardar produto");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este produto?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto eliminado");
    } catch (error) {
      toast.error("Erro ao eliminar");
    }
  };

  const handleToggleActive = async (product: RecommendedProduct) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, is_active: !product.is_active });
      toast.success(product.is_active ? "Produto desativado" : "Produto ativado");
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Produtos Recomendados</h1>
              <p className="text-xs text-white/60">Produtos externos com links de afiliado</p>
            </div>
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>

        {/* Products list */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </>
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product.id)}
                onToggleActive={() => handleToggleActive(product)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">Nenhum produto</p>
              <Button variant="outline" className="mt-4" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro produto
              </Button>
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto Recomendado"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              onCancel={() => setShowDialog(false)}
              isEditing={!!editingProduct}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthGuard>
  );
}
