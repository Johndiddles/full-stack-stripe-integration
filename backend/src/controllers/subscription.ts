import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../config/stripe";
import { User, IUser } from "../models/User";
import { Subscription } from "../models/Subscription";
import { StripeService } from "../services/stripe";

interface AuthRequest extends Request {
  user?: IUser;
}

// Get all subscriptions for a user
export const getSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user._id);
    if (!user?.stripeCustomerId) {
      return res.json([]);
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      expand: ["data.default_payment_method"],
    });

    res.json(subscriptions.data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Error fetching subscriptions" });
  }
};

// Create a new subscription
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { priceId, cardDetails } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: cardDetails.card,
    });

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    // Store payment method in user's document
    const paymentMethods = user.paymentMethods || [];
    paymentMethods.push({
      stripePaymentMethodId: paymentMethod.id,
      last4: paymentMethod.card?.last4 || "",
      brand: paymentMethod.card?.brand || "",
      expMonth: paymentMethod.card?.exp_month || 0,
      expYear: paymentMethod.card?.exp_year || 0,
    });
    user.paymentMethods = paymentMethods;
    await user.save();

    // Return subscription with client secret for 3D Secure if needed
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    res.json({
      subscription,
      clientSecret: paymentIntent?.client_secret,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error creating subscription",
    });
  }
};

// Cancel a subscription
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { subscriptionId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user?.stripeCustomerId) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.customer !== user.stripeCustomerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ message: "Error cancelling subscription" });
  }
};

export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const user = req.user;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: user._id,
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    return res.json({
      subscription: {
        id: subscription._id,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: "Failed to get subscription" });
  }
};

export const getUserSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const subscriptions = await Subscription.find({ userId: user._id });

    return res.json({
      subscriptions: subscriptions.map((subscription) => ({
        id: subscription._id,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      })),
    });
  } catch (error) {
    return res.status(400).json({ error: "Failed to get subscriptions" });
  }
};
