export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  stripePriceId: string;
}

export const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "Perfect for getting started",
    price: 9.99,
    interval: "month",
    features: ["Basic feature 1", "Basic feature 2", "Basic feature 3"],
    stripePriceId: "price_1RMp0YIxctPLzLHelg6tPmG4",
  },
  {
    id: "pro",
    name: "Pro Plan",
    description: "For professionals who need more",
    price: 19.99,
    interval: "month",
    features: [
      "Pro feature 1",
      "Pro feature 2",
      "Pro feature 3",
      "Pro feature 4",
    ],
    stripePriceId: "price_1RMp1oIxctPLzLHeurxRDmcz",
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "For large organizations",
    price: 49.99,
    interval: "month",
    features: [
      "Enterprise feature 1",
      "Enterprise feature 2",
      "Enterprise feature 3",
      "Enterprise feature 4",
      "Enterprise feature 5",
    ],
    stripePriceId: "price_1RMp32IxctPLzLHeGZB2k0I8",
  },
];
