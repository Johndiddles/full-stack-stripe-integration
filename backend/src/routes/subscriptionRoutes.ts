import express from "express";
import {
  getSubscriptions,
  cancelSubscription,
  createSubscription,
  handleWebhook,
} from "../controllers/subscriptionController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all subscriptions for the authenticated user
router.get("/", getSubscriptions);

// Create a new subscription
router.post("/", authenticateToken, createSubscription);

// Cancel a subscription
router.post("/:subscriptionId/cancel", cancelSubscription);

// Handle Stripe webhooks
router.post("/webhook", handleWebhook);

export default router;

// import { Router } from "express";
// import {
//   createSubscription,
//   handleWebhook,
// } from "../controllers/subscriptionController";
// import { authenticateToken } from "../middleware/auth";

// const router = Router();

// // Create a new subscription
// router.post("/", authenticateToken, createSubscription);

// // Handle Stripe webhooks
// router.post("/webhook", handleWebhook);

// export default router;
