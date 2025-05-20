import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "@/config/stripe";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
