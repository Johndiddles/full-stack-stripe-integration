import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStripe } from "@/contexts/StripeContext";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm";
import SubscriptionForm from "@/components/SubscriptionForm";
import Layout from "@/components/Layout";

const Home: React.FC = () => {
  const { user } = useAuth();
  const { stripe, loading: stripeLoading } = useStripe();

  const handlePaymentSuccess = () => {
    // Handle successful payment
    console.log("Payment successful");
  };

  const handlePaymentError = (error: string) => {
    // Handle payment error
    console.error("Payment error:", error);
  };

  const handleSubscriptionSuccess = () => {
    // Handle successful subscription
    console.log("Subscription successful");
  };

  const handleSubscriptionError = (error: string) => {
    // Handle subscription error
    console.error("Subscription error:", error);
  };

  console.log({ stripe, stripeLoading, user });
  if (stripeLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome to Stripe Payment
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Secure payment processing with Stripe
          </p>
        </div>

        {user ? (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                One-time Payment
              </h2>
              {stripe && (
                <Elements stripe={stripe}>
                  <PaymentForm
                    amount={2000} // $20.00
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Subscription
              </h2>
              {stripe && (
                <Elements stripe={stripe}>
                  <SubscriptionForm
                    priceId="price_H5ggYwtDq4fbrJ" // Replace with your Stripe price ID
                    onSuccess={handleSubscriptionSuccess}
                    onError={handleSubscriptionError}
                  />
                </Elements>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Please{" "}
              <a
                href="/login"
                className="text-primary-600 hover:text-primary-700"
              >
                login
              </a>{" "}
              or{" "}
              <a
                href="/register"
                className="text-primary-600 hover:text-primary-700"
              >
                register
              </a>{" "}
              to make payments or subscribe.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
