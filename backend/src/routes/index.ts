import express from "express";
import authRoutes from "./authRoutes";
import subscriptionRoutes from "./subscriptionRoutes";
import * as paymentController from "../controllers/payment";
import * as webhookController from "../controllers/webhook";
import { auth } from "../middleware/auth";

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// Subscription routes
router.use("/subscriptions", subscriptionRoutes);

// Payment routes
router.post(
  "/payments/create-payment-intent",
  auth,
  paymentController.createPaymentIntent
);
router.get("/payments/:paymentId", auth, paymentController.getPayment);
router.get("/payments/user/:userId", auth, paymentController.getUserPayments);

// Webhook route
router.post("/webhooks/stripe", webhookController.handleWebhook);

export default router;
