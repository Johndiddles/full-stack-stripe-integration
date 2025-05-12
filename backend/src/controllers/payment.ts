import { Request, Response } from "express";
// import { User } from "../models/User";
import { Payment } from "../models/Payment";
import { StripeService } from "../services/stripe";

interface AuthRequest extends Request {
  user?: any;
}

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency = "usd" } = req.body;
    const user = req.user;

    const paymentIntent = await StripeService.createPaymentIntent(
      amount,
      currency,
      user.stripeCustomerId
    );
    console.log({ paymentIntent });

    // Create payment record in database
    const payment = new Payment({
      userId: user._id,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: paymentIntent.status,
    });

    await payment.save();
    console.log({ payment });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    console.log({ error });
    return res.status(400).json({ error: "Failed to create payment intent" });
  }
};

export const getPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const user = req.user;

    const payment = await Payment.findOne({
      _id: paymentId,
      userId: user._id,
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.json({
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: "Failed to get payment" });
  }
};

export const getUserPayments = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      payments: payments.map((payment) => ({
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    return res.status(400).json({ error: "Failed to get payments" });
  }
};
