import { Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../config";

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2022-11-15",
});

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    // console.log({ user: req.user });
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get customer ID from your database using userId
    // For now, we'll assume the customer ID is stored in the user object
    const customerId = req.user?.stripeCustomerId;
    if (!customerId) {
      return res.status(404).json({ error: "No Stripe customer found" });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      //   expand: ["data.default_payment_method", "data.items.data.price.product"],
    });

    // console.log({ subscriptions });

    return res.json(subscriptions.data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify that the subscription belongs to the user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = req.user?.stripeCustomerId;

    if (subscription.customer !== customerId) {
      return res
        .status(403)
        .json({ error: "Not authorized to cancel this subscription" });
    }

    // Cancel the subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    return res.json(canceledSubscription);
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    console.log({ priceId, paymentMethodId });
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const customerId = req.user?.stripeCustomerId;
    if (!customerId) {
      return res.status(404).json({ error: "No Stripe customer found" });
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set it as the default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    console.log({ subscription });

    return res.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({ error: "Failed to create subscription" });
  }
};
