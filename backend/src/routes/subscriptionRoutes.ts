import express from "express";
import {
  getSubscriptions,
  cancelSubscription,
  createSubscription,
} from "../controllers/subscriptionController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all subscriptions for the authenticated user
router.get("/", getSubscriptions);

// Create a new subscription
router.post("/", createSubscription);

// Cancel a subscription
router.post("/:subscriptionId/cancel", cancelSubscription);

export default router;
