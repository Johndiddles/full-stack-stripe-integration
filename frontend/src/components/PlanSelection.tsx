"use client";
import React, { useEffect, useState } from "react";
import { Plan, plans } from "@/config/plans";
import SubscriptionForm from "./SubscriptionForm";

interface PlanSelectionProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({
  onSuccess,
  onError,
}) => {
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const response = await fetch("http://localhost:4000/api/tiers");
      const data = await response.json();
      console.log({ data });
      setAllPlans(
        data.data.map((plan: any) => ({
          id: plan._id,
          name: plan.name,
          description: plan.intendedUsers,
          price: plan.monthlyPrice,
          interval: "month",
          features: plan.keyFeatures,
          stripePriceId: plan.stripeMonthlyPriceId,
        }))
      );
    };
    fetchPlans();
  }, []);

  console.log({ allPlans });

  if (selectedPlan) {
    return (
      <div className="mt-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Subscribe to {selectedPlan.name}
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>{selectedPlan.description}</p>
            </div>
            <div className="mt-5">
              <SubscriptionForm
                priceId={selectedPlan.stripePriceId}
                onSuccess={onSuccess}
                onError={onError}
              />
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
      {allPlans.map((plan) => (
        <div
          key={plan.id}
          className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
        >
          <div className="p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              {plan.name}
            </h2>
            <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">
                ${plan.price}
              </span>
              <span className="text-base font-medium text-gray-500">
                /{plan.interval}
              </span>
            </p>
            <button
              // onClick={() => setSelectedPlan(plan)}
              onClick={async () => {
                const response = await fetch(
                  "http://localhost:4000/api/payments/create-checkout-session",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    credentials: "include",
                    body: JSON.stringify({
                      priceId: plan.stripePriceId,
                      successUrl: "https://example.com/success",
                      cancelUrl: "https://example.com/cancel",
                    }),
                  }
                );

                const data = await response.json();
                console.log({ data });
                window.location.href = data.data.url;
              }}
              className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
            >
              Select {plan.name}
            </button>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
              What's included
            </h3>
            <ul className="mt-6 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanSelection;
