import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "./useLanguage";
import { useAuth } from "./useAuth";

export type ProductType = "academy_item" | "premium_offer" | "store_item";

interface UseCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useCheckout(options: UseCheckoutOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();

  const checkout = async (
    productId: string,
    productType: ProductType,
    asGuest = false
  ) => {
    if (isLoading) return;

    // If not logged in and not guest checkout, prompt
    if (!user && !asGuest) {
      toast.info(
        language === "pt"
          ? "Inicia sessão para continuar ou compra como convidado."
          : "Log in to continue or buy as guest."
      );
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          productId, 
          productType, 
          guestCheckout: asGuest 
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe checkout (same tab to avoid popup blockers)
        window.location.href = data.url;
        options.onSuccess?.();
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      toast.error(
        language === "pt" 
          ? "Erro ao iniciar compra. Tenta novamente." 
          : "Checkout failed. Please try again."
      );
      options.onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkout,
    isLoading,
  };
}
