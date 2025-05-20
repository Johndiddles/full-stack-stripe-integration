import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStripe } from "@stripe/react-stripe-js";
import SubscriptionForm from "../components/SubscriptionForm";
import PlanSelection from "@/components/PlanSelection";

interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        product: {
          name: string;
        };
        unit_amount: number;
        currency: string;
      };
    }>;
  };
}

export default function Subscriptions() {
  const { user } = useAuth();
  // const { stripe } = useStripe();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/subscriptions",
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch subscriptions");
        const data = await response.json();
        setSubscriptions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load subscriptions"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/subscriptions/${subscriptionId}/cancel`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to cancel subscription");
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === subscriptionId
            ? { ...sub, cancel_at_period_end: true }
            : sub
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel subscription"
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Please log in to manage your subscriptions
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Loading subscriptions...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Subscription Management
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage your active subscriptions and create new ones
          </p>
        </div>

        {error && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <li key={subscription.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {subscription.items.data[0].price.product.name}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            Status: {subscription.status}
                          </span>
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            Renews:{" "}
                            {new Date(
                              subscription.current_period_end * 1000
                            ).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {!subscription.cancel_at_period_end && (
                          <button
                            onClick={() =>
                              handleCancelSubscription(subscription.id)
                            }
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Cancel Subscription
                          </button>
                        )}
                        {subscription.cancel_at_period_end && (
                          <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100">
                            Cancelling at period end
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Subscription
              </h3>
              <div className="mt-5">
                <PlanSelection
                  onSuccess={() => {
                    // Refresh subscriptions list
                    // window.location.reload();
                  }}
                  onError={(error) => setError(error)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
