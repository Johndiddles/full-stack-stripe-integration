import { Request, Response } from "express";
import { StripeService } from "../services/stripe";

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "No signature found" });
  }

  try {
    await StripeService.handleWebhookEvent(req.body, sig as string);
    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(400).json({ error: "Webhook error" });
  }
};
