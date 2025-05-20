import Stripe from "stripe";
import { config } from "../config";
import { User } from "../models/User";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2022-11-15",
});

export class StripeService {
  // Create a new customer
  static async createCustomer(email: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
    });
    return customer.id;
  }

  // Create a subscription
  static async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
    return subscription;
  }

  // Cancel a subscription
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return subscription;
  }

  // Create a payment intent
  static async createPaymentIntent(
    amount: number,
    currency: string = "usd",
    customerId: string
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  }

  // Handle webhook events
  static async handleWebhookEvent(
    payload: Buffer,
    signature: string
  ): Promise<void> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret
    );

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeletion(
          event.data.object as Stripe.Subscription
        );
        break;

      case "payment_intent.succeeded":
        await this.handlePaymentSuccess(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.payment_failed":
        await this.handlePaymentFailure(
          event.data.object as Stripe.PaymentIntent
        );
        break;
    }
  }

  // Handle subscription changes
  private static async handleSubscriptionChange(
    subscription: Stripe.Subscription
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    const user = await User.findOne({ stripeCustomerId: customer.id });

    if (!user) return;

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      { upsert: true }
    );

    user.subscriptionStatus =
      subscription.status === "active" ? "active" : "inactive";
    await user.save();
  }

  // Handle subscription deletion
  private static async handleSubscriptionDeletion(
    subscription: Stripe.Subscription
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    const user = await User.findOne({ stripeCustomerId: customer.id });

    if (!user) return;

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { status: "canceled" }
    );

    // user.subscriptionStatus = "cancelled";
    user.subscriptionStatus = "inactive";
    await user.save();
  }

  // Handle successful payment
  // Handle successful payment
  private static async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      paymentIntent.customer as string
    );
    const user = await User.findOne({ stripeCustomerId: customer.id });

    if (!user) return;

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: "succeeded",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      { upsert: true }
    );
  }

  // Handle failed payment
  private static async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      paymentIntent.customer as string
    );
    const user = await User.findOne({ stripeCustomerId: customer.id });

    if (!user) return;

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: "canceled",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      { upsert: true }
    );
  }
}
