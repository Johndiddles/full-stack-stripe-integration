import { Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../config";
import { StripeService } from "../services/stripeService";
import { User } from "../models/User";

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
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create subscription
    const subscription = await StripeService.createSubscription({
      customerId,
      priceId,
      paymentMethodId,
    });

    // Get the client secret from the subscription's latest invoice
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      requiresAction: paymentIntent.status === "requires_action",
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.stripeWebhookSecret
    );

    await StripeService.handleWebhookEvent(event);

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({
      message: error instanceof Error ? error.message : "Webhook error",
    });
  }
};
