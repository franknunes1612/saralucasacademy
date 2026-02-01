import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePremiumOffers, useCreatePremiumOffer, useUpdatePremiumOffer, useDeletePremiumOffer, type PremiumOffer, type PremiumOfferInsert } from "@/hooks/usePremiumOffers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const ICON_OPTIONS = ["sparkles", "dumbbell", "heart", "gift", "star", "zap", "crown"];

export default function AdminPremium() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: offers, isLoading } = usePremiumOffers(true);
  const createOffer = useCreatePremiumOffer();
  const updateOffer = useUpdatePremiumOffer();
  const deleteOffer = useDeletePremiumOffer();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<PremiumOffer | null>(null);
  const [formData, setFormData] = useState<Partial<PremiumOfferInsert> & { 
    stripe_product_id?: string; 
    stripe_price_id?: string;
    button_text_pt?: string;
    button_text_en?: string;
    enable_purchase?: boolean;
  }>({
    title_pt: "",
    title_en: "",
    subtitle_pt: "",
    subtitle_en: "",
    price: 0,
    currency: "EUR",
    billing_type: "one-time",
    features_pt: [],
    features_en: [],
    badge_pt: "",
    badge_en: "",
    icon: "sparkles",
    accent_color: "bg-primary",
    is_active: true,
    display_order: 0,
    stripe_product_id: "",
    stripe_price_id: "",
    button_text_pt: "Comprar",
    button_text_en: "Buy",
    enable_purchase: true,
  });
  const [featuresTextPt, setFeaturesTextPt] = useState("");
  const [featuresTextEn, setFeaturesTextEn] = useState("");

  const resetForm = () => {
    setFormData({
      title_pt: "",
      title_en: "",
      subtitle_pt: "",
      subtitle_en: "",
      price: 0,
      currency: "EUR",
      billing_type: "one-time",
      features_pt: [],
      features_en: [],
      badge_pt: "",
      badge_en: "",
      icon: "sparkles",
      accent_color: "bg-primary",
      is_active: true,
      display_order: offers?.length || 0,
      stripe_product_id: "",
      stripe_price_id: "",
      button_text_pt: "Comprar",
      button_text_en: "Buy",
      enable_purchase: true,
    });
    setFeaturesTextPt("");
    setFeaturesTextEn("");
    setEditingOffer(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (offer: PremiumOffer & { stripe_product_id?: string; stripe_price_id?: string; button_text_pt?: string; button_text_en?: string; enable_purchase?: boolean }) => {
    setEditingOffer(offer);
    setFormData({
      title_pt: offer.title_pt,
      title_en: offer.title_en,
      subtitle_pt: offer.subtitle_pt || "",
      subtitle_en: offer.subtitle_en || "",
      price: offer.price,
      currency: offer.currency,
      billing_type: offer.billing_type,
      features_pt: offer.features_pt,
      features_en: offer.features_en,
      badge_pt: offer.badge_pt || "",
      badge_en: offer.badge_en || "",
      icon: offer.icon || "sparkles",
      accent_color: offer.accent_color || "bg-primary",
      is_active: offer.is_active,
      display_order: offer.display_order,
      stripe_product_id: offer.stripe_product_id || "",
      stripe_price_id: offer.stripe_price_id || "",
      button_text_pt: offer.button_text_pt || "Comprar",
      button_text_en: offer.button_text_en || "Buy",
      enable_purchase: offer.enable_purchase !== false,
    });
    setFeaturesTextPt(offer.features_pt.join("\n"));
    setFeaturesTextEn(offer.features_en.join("\n"));
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title_pt || !formData.title_en || !formData.billing_type) {
      toast.error(t({ pt: "Preencha os campos obrigatórios", en: "Fill required fields" }));
      return;
    }

    const payload = {
      ...formData,
      features_pt: featuresTextPt.split("\n").filter(Boolean),
      features_en: featuresTextEn.split("\n").filter(Boolean),
    } as PremiumOfferInsert;

    try {
      if (editingOffer) {
        await updateOffer.mutateAsync({ id: editingOffer.id, ...payload });
        toast.success(t({ pt: "Oferta atualizada", en: "Offer updated" }));
      } else {
        await createOffer.mutateAsync(payload);
        toast.success(t({ pt: "Oferta criada", en: "Offer created" }));
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(t({ pt: "Erro ao guardar", en: "Error saving" }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t({ pt: "Eliminar esta oferta?", en: "Delete this offer?" }))) return;
    try {
      await deleteOffer.mutateAsync(id);
      toast.success(t({ pt: "Oferta eliminada", en: "Offer deleted" }));
    } catch (error) {
      toast.error(t({ pt: "Erro ao eliminar", en: "Error deleting" }));
    }
  };

  const toggleActive = async (offer: PremiumOffer) => {
    try {
      await updateOffer.mutateAsync({ id: offer.id, is_active: !offer.is_active });
      toast.success(offer.is_active 
        ? t({ pt: "Oferta desativada", en: "Offer deactivated" })
        : t({ pt: "Oferta ativada", en: "Offer activated" })
      );
    } catch (error) {
      toast.error(t({ pt: "Erro ao atualizar", en: "Error updating" }));
    }
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
              {t({ pt: "Ofertas Premium", en: "Premium Offers" })}
            </h1>
            <p className="text-xs text-white/60">
              {t({ pt: "Gerir planos e preços", en: "Manage plans and pricing" })}
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          {t({ pt: "Nova", en: "New" })}
        </Button>
      </div>

      {/* Offers list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="result-card p-4 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : offers?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">{t({ pt: "Sem ofertas", en: "No offers yet" })}</p>
          <Button onClick={openCreateDialog} variant="outline" className="mt-4">
            {t({ pt: "Criar primeira oferta", en: "Create first offer" })}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers?.map((offer) => (
            <div
              key={offer.id}
              className={`result-card p-4 ${!offer.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-white/30 mt-1 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {language === "pt" ? offer.title_pt : offer.title_en}
                    </h3>
                    {offer.badge_pt && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success">
                        {language === "pt" ? offer.badge_pt : offer.badge_en}
                      </span>
                    )}
                    {!offer.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                        {t({ pt: "Inativo", en: "Inactive" })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">
                    €{Number(offer.price).toFixed(2)} • {offer.billing_type}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(offer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title={offer.is_active ? "Deactivate" : "Activate"}
                  >
                    {offer.is_active ? (
                      <Eye className="h-4 w-4 text-white/60" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-white/40" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditDialog(offer)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
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
              {editingOffer
                ? t({ pt: "Editar Oferta", en: "Edit Offer" })
                : t({ pt: "Nova Oferta", en: "New Offer" })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Titles */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Título (PT) *</label>
                <Input
                  value={formData.title_pt}
                  onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                  placeholder="Plano Personalizado"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Title (EN) *</label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Personalized Plan"
                />
              </div>
            </div>

            {/* Subtitles */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Subtítulo (PT)</label>
                <Input
                  value={formData.subtitle_pt || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle_pt: e.target.value })}
                  placeholder="O mais popular"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Subtitle (EN)</label>
                <Input
                  value={formData.subtitle_en || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                  placeholder="Most popular"
                />
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Badge (PT)</label>
                <Input
                  value={formData.badge_pt || ""}
                  onChange={(e) => setFormData({ ...formData, badge_pt: e.target.value })}
                  placeholder="Mais Popular"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Badge (EN)</label>
                <Input
                  value={formData.badge_en || ""}
                  onChange={(e) => setFormData({ ...formData, badge_en: e.target.value })}
                  placeholder="Most Popular"
                />
              </div>
            </div>

            {/* Price & Billing */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Preço", en: "Price" })} *</label>
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
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Tipo", en: "Type" })} *</label>
                <Select
                  value={formData.billing_type}
                  onValueChange={(v) => setFormData({ ...formData, billing_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">{t({ pt: "Único", en: "One-time" })}</SelectItem>
                    <SelectItem value="monthly">{t({ pt: "Mensal", en: "Monthly" })}</SelectItem>
                    <SelectItem value="yearly">{t({ pt: "Anual", en: "Yearly" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Ícone", en: "Icon" })}</label>
                <Select
                  value={formData.icon || "sparkles"}
                  onValueChange={(v) => setFormData({ ...formData, icon: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Cor", en: "Color" })}</label>
                <Select
                  value={formData.accent_color || "bg-primary"}
                  onValueChange={(v) => setFormData({ ...formData, accent_color: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-primary">Primary</SelectItem>
                    <SelectItem value="bg-success">Success</SelectItem>
                    <SelectItem value="bg-secondary">Secondary</SelectItem>
                    <SelectItem value="bg-warning">Warning</SelectItem>
                    <SelectItem value="bg-destructive">Destructive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Features PT */}
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                {t({ pt: "Funcionalidades (PT) - uma por linha", en: "Features (PT) - one per line" })}
              </label>
              <Textarea
                value={featuresTextPt}
                onChange={(e) => setFeaturesTextPt(e.target.value)}
                placeholder="Plano personalizado&#10;Acesso ilimitado&#10;Suporte prioritário"
                rows={4}
              />
            </div>

            {/* Features EN */}
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                {t({ pt: "Funcionalidades (EN) - uma por linha", en: "Features (EN) - one per line" })}
              </label>
              <Textarea
                value={featuresTextEn}
                onChange={(e) => setFeaturesTextEn(e.target.value)}
                placeholder="Personalized plan&#10;Unlimited access&#10;Priority support"
                rows={4}
              />
            </div>

            {/* Stripe Configuration Section */}
            <div className="border-t border-white/10 pt-4 mt-4">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                💳 {t({ pt: "Configuração Stripe", en: "Stripe Configuration" })}
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Stripe Product ID</label>
                  <Input
                    value={formData.stripe_product_id || ""}
                    onChange={(e) => setFormData({ ...formData, stripe_product_id: e.target.value })}
                    placeholder="prod_xxxxx"
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">Stripe Price ID</label>
                  <Input
                    value={formData.stripe_price_id || ""}
                    onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                    placeholder="price_xxxxx"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Texto botão (PT)", en: "Button text (PT)" })}</label>
                  <Input
                    value={formData.button_text_pt || ""}
                    onChange={(e) => setFormData({ ...formData, button_text_pt: e.target.value })}
                    placeholder="Comprar"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1 block">{t({ pt: "Texto botão (EN)", en: "Button text (EN)" })}</label>
                  <Input
                    value={formData.button_text_en || ""}
                    onChange={(e) => setFormData({ ...formData, button_text_en: e.target.value })}
                    placeholder="Buy"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <label className="text-sm text-white/80">{t({ pt: "Permitir compra", en: "Enable purchase" })}</label>
                <Switch
                  checked={formData.enable_purchase !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, enable_purchase: checked })}
                />
              </div>
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
            <Button onClick={handleSave} disabled={createOffer.isPending || updateOffer.isPending}>
              {t({ pt: "Guardar", en: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
