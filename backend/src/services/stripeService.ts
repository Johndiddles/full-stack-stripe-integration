import Stripe from "stripe";
import { config } from "../config";

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2022-11-15",
});

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  paymentMethodId: string;
}

export class StripeService {
  static async createPaymentMethod(card: any) {
    return await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: card.number,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvc: card.cvc,
      },
    });
  }

  static async createSubscription({
    customerId,
    priceId,
    paymentMethodId,
  }: CreateSubscriptionParams) {
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

    return subscription;
  }

  static async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // Handle subscription status changes
        const subscription = event.data.object as Stripe.Subscription;
        // Update your database with the new subscription status
        return subscription;

      case "invoice.payment_succeeded":
        // Handle successful payment
        const invoice = event.data.object as Stripe.Invoice;
        // Update your database with the payment status
        return invoice;

      case "invoice.payment_failed":
        // Handle failed payment
        const failedInvoice = event.data.object as Stripe.Invoice;
        // Update your database with the failed payment status
        return failedInvoice;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return null;
    }
  }
}
