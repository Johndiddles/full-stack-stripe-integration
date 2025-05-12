"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

interface StripeContextType {
  stripe: Stripe | null;
  loading: boolean;
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  loading: true,
});

export const useStripe = () => useContext(StripeContext);

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      console.log("Initializing Stripe");
      try {
        const stripeInstance = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        );
        console.log({ stripeInstance });
        setStripe(stripeInstance);
      } catch (error) {
        console.error("Failed to load Stripe:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  console.log({ stripe, loading });

  return (
    <StripeContext.Provider value={{ stripe, loading }}>
      {children}
    </StripeContext.Provider>
  );
};
