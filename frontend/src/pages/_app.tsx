import "@/styles/globals.css";
import { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripeProvider } from "@/contexts/StripeContext";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <StripeProvider>
        <Elements stripe={stripePromise}>
          <Component {...pageProps} />
        </Elements>
      </StripeProvider>
    </AuthProvider>
  );
}
