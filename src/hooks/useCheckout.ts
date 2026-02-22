import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "./useLanguage";
import { useAuth } from "./useAuth";

export type ProductType = "academy_item" | "premium_offer" | "store_item";

interface UseCheckoutOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  /** Called when user is not logged in — use to open AuthModal */
  onRequireAuth?: () => void;
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

    // If not logged in: for low-friction purchases, go straight to guest checkout.
    // For higher-value items, prompt auth. Always provide a path forward.
    if (!user && !asGuest) {
      // Automatically proceed as guest for store items (digital products).
      // For academy items / premium offers, show auth prompt with guest option.
      if (productType === "store_item") {
        // Proceed as guest automatically — reduces friction for impulse buys
        return checkout(productId, productType, true);
      }

      // For premium items, show a non-blocking toast with clear actions
      toast.info(
        language === "pt"
          ? "Para continuar, inicia sessão ou compra como convidado."
          : "To continue, sign in or buy as guest.",
        {
          action: {
            label: language === "pt" ? "Comprar como convidado" : "Buy as guest",
            onClick: () => checkout(productId, productType, true),
          },
          duration: 6000,
        }
      );

      // Also trigger the auth modal if the parent provided the callback
      options.onRequireAuth?.();
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          productId,
          productType,
          guestCheckout: asGuest,
        },
      });

      if (error) throw error;

      if (data?.url) {
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
