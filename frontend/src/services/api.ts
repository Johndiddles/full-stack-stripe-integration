import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: async (email: string, password: string) => {
    const response = await api.post("/auth/register", { email, password });
    return response.data;
  },
  login: async (email: string, password: string) => {
    // const response = await api.post("/auth/login", { email, password });
    // return response.data;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();
    return data.data;
  },
};

export const subscriptions = {
  create: async (priceId: string) => {
    const response = await api.post("/subscriptions", { priceId });
    return response.data;
  },
  get: async (subscriptionId: string) => {
    const response = await api.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  },
  cancel: async (subscriptionId: string) => {
    const response = await api.put(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  },
  getUserSubscriptions: async (userId: string) => {
    const response = await api.get(`/subscriptions/user/${userId}`);
    return response.data;
  },
};

export const payments = {
  createPaymentIntent: async (amount: number, currency: string = "usd") => {
    const response = await api.post("/payments/create-payment-intent", {
      amount,
      currency,
    });
    return response.data;
  },
  get: async (paymentId: string) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
  getUserPayments: async (userId: string) => {
    const response = await api.get(`/payments/user/${userId}`);
    return response.data;
  },
};

export default api;
