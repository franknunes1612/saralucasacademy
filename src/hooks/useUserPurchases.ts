import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserPurchase {
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
  updated_at: string;
}

export function useUserPurchases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (error) throw error;
      return data as UserPurchase[];
    },
    enabled: !!user,
  });
}

export function useHasPurchased(courseId: string) {
  const { data: purchases, isLoading } = useUserPurchases();
  
  const hasPurchased = purchases?.some(p => p.course_id === courseId) ?? false;
  
  return { hasPurchased, isLoading };
}

// Admin hook for managing all purchases
export function useAdminPurchases() {
  const queryClient = useQueryClient();

  const query = useQuery({
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
      return data;
    },
  });

  const grantAccess = useMutation({
    mutationFn: async ({ 
      userId, 
      courseId, 
      paymentMethod = "manual",
      paymentReference,
      amountPaid 
    }: { 
      userId: string; 
      courseId: string; 
      paymentMethod?: string;
      paymentReference?: string;
      amountPaid?: number;
    }) => {
      const { data, error } = await supabase
        .from("user_purchases")
        .insert({
          user_id: userId,
          course_id: courseId,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          amount_paid: amountPaid,
          status: "completed",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
    },
  });

  return {
    ...query,
    grantAccess: grantAccess.mutateAsync,
    revokeAccess: revokeAccess.mutateAsync,
    isGranting: grantAccess.isPending,
    isRevoking: revokeAccess.isPending,
  };
}
