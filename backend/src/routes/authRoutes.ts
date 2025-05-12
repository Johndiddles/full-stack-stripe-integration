import express from "express";
import * as authController from "../controllers/auth";

const router = express.Router();

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
