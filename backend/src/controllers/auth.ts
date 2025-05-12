import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { StripeService } from "../services/stripe";
import { config } from "../config";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log({ email, password });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create Stripe customer
    const stripeCustomerId = await StripeService.createCustomer(email);
    console.log({ stripeCustomerId });
    // Create user
    const user = new User({
      email,
      password,
      stripeCustomerId,
    });

    await user.save();
    console.log({ user });

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id.toString(),
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
      },
      config.jwtSecret
    );
    console.log({ token });
    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
      },
      token,
    });
  } catch (error) {
    console.log({ error });
    return res.status(400).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id.toString(),
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
      },
      config.jwtSecret
    );

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
      },
      token,
    });
  } catch (error) {
    return res.status(400).json({ error: "Login failed" });
  }
};
