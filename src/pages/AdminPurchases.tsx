import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Search, UserPlus, Trash2, Check, X, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAcademyItems } from "@/hooks/useAcademyItems";
import { useLanguage } from "@/hooks/useLanguage";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PurchaseWithDetails {
  id: string;
  user_id: string;
  course_id: string;
  purchase_date: string;
  payment_method: string | null;
  payment_reference: string | null;
  amount_paid: number | null;
  currency: string;
  status: string;
  created_at: string;
  academy_items: {
    title_pt: string;
    title_en: string;
    price: number;
  } | null;
}

interface UserInfo {
  id: string;
  email: string;
}

export default function AdminPurchases() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [searchEmail, setSearchEmail] = useState("");
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [grantForm, setGrantForm] = useState({
    email: "",
    courseId: "",
    paymentMethod: "manual",
    paymentReference: "",
    amountPaid: "",
  });

  // Fetch all purchases
  const { data: purchases, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_purchases")
        .select(`
          *,
          academy_items:course_id (
            title_pt,
            title_en,
            price
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PurchaseWithDetails[];
    },
  });

  // Fetch courses for dropdown
  const { data: courses } = useAcademyItems("course");

  // Search for user by email (using edge function would be better, but for now we'll use a workaround)
  const searchUser = useMutation({
    mutationFn: async (email: string): Promise<UserInfo | null> => {
      // Note: In production, this should be an edge function for security
      // For now, we'll rely on the admin to enter valid user IDs
      return { id: email, email }; // Placeholder
    },
  });

  // Grant access mutation
  const grantAccess = useMutation({
    mutationFn: async (data: {
      userId: string;
      courseId: string;
      paymentMethod: string;
      paymentReference?: string;
      amountPaid?: number;
    }) => {
      const { error } = await supabase
        .from("user_purchases")
        .insert({
          user_id: data.userId,
          course_id: data.courseId,
          payment_method: data.paymentMethod,
          payment_reference: data.paymentReference || null,
          amount_paid: data.amountPaid || null,
          status: "completed",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchases"] });
      toast.success("Access granted successfully");
      setIsGrantDialogOpen(false);
      setGrantForm({
        email: "",
        courseId: "",
        paymentMethod: "manual",
        paymentReference: "",
        amountPaid: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to grant access");
    },
  });

  // Revoke access mutation
  const revokeAccess = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase
        .from("user_purchases")
        .delete()
        .eq("id", purchaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchases"] });
      toast.success("Access revoked");
    },
    onError: () => {
      toast.error("Failed to revoke access");
    },
  });

  const handleGrantSubmit = () => {
    if (!grantForm.email || !grantForm.courseId) {
      toast.error("Please fill in all required fields");
      return;
    }

    grantAccess.mutate({
      userId: grantForm.email, // Using email as user_id placeholder - in production, lookup user first
      courseId: grantForm.courseId,
      paymentMethod: grantForm.paymentMethod,
      paymentReference: grantForm.paymentReference || undefined,
      amountPaid: grantForm.amountPaid ? parseFloat(grantForm.amountPaid) : undefined,
    });
  };

  const filteredPurchases = purchases?.filter((p) => {
    if (!searchEmail) return true;
    return p.user_id.toLowerCase().includes(searchEmail.toLowerCase());
  });

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">User Purchases</h1>
            <p className="text-xs text-white/60">Manage course access</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search by user ID..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[hsl(155_40%_45%)] hover:bg-[hsl(155_40%_40%)] text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Grant Access
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Grant Course Access</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">User ID *</Label>
                  <Input
                    placeholder="Enter user UUID"
                    value={grantForm.email}
                    onChange={(e) => setGrantForm({ ...grantForm, email: e.target.value })}
                    className="bg-white/10 border-white/10 text-white"
                  />
                  <p className="text-xs text-white/40">
                    Get the user ID from the authentication system
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Course *</Label>
                  <Select
                    value={grantForm.courseId}
                    onValueChange={(value) => setGrantForm({ ...grantForm, courseId: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/10 text-white">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/10">
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-white">
                          {language === "pt" ? course.title_pt : course.title_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Payment Method</Label>
                  <Select
                    value={grantForm.paymentMethod}
                    onValueChange={(value) => setGrantForm({ ...grantForm, paymentMethod: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/10">
                      <SelectItem value="manual" className="text-white">Manual Grant</SelectItem>
                      <SelectItem value="gumroad" className="text-white">Gumroad</SelectItem>
                      <SelectItem value="hotmart" className="text-white">Hotmart</SelectItem>
                      <SelectItem value="stripe" className="text-white">Stripe</SelectItem>
                      <SelectItem value="other" className="text-white">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Payment Reference</Label>
                  <Input
                    placeholder="Transaction ID or order number"
                    value={grantForm.paymentReference}
                    onChange={(e) => setGrantForm({ ...grantForm, paymentReference: e.target.value })}
                    className="bg-white/10 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Amount Paid</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={grantForm.amountPaid}
                    onChange={(e) => setGrantForm({ ...grantForm, amountPaid: e.target.value })}
                    className="bg-white/10 border-white/10 text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsGrantDialogOpen(false)}
                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGrantSubmit}
                    disabled={grantAccess.isPending}
                    className="flex-1 bg-[hsl(155_40%_45%)] hover:bg-[hsl(155_40%_40%)] text-white"
                  >
                    {grantAccess.isPending ? "Granting..." : "Grant Access"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Purchases List */}
        <div className="space-y-3">
          {isLoadingPurchases ? (
            <div className="text-center py-8 text-white/50">Loading...</div>
          ) : filteredPurchases?.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No purchases found</p>
            </div>
          ) : (
            filteredPurchases?.map((purchase, index) => {
              const courseTitle = purchase.academy_items
                ? language === "pt"
                  ? purchase.academy_items.title_pt
                  : purchase.academy_items.title_en
                : "Unknown Course";

              return (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{courseTitle}</h3>
                      <p className="text-xs text-white/50 truncate mt-1">
                        User: {purchase.user_id.slice(0, 8)}...
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60">
                          {purchase.payment_method || "external"}
                        </span>
                        {purchase.amount_paid && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(155_40%_45%)]/20 text-[hsl(155_40%_60%)]">
                            €{purchase.amount_paid.toFixed(2)}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-[hsl(155_40%_45%)] text-white font-medium">
                        <Check className="h-3 w-3 inline mr-1" />
                        {purchase.status}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm("Revoke access for this user?")) {
                            revokeAccess.mutate(purchase.id);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
