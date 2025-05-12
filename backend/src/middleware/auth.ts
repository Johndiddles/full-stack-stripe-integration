import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        stripeCustomerId?: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  // console.log({ authHeader });
  const token = authHeader && authHeader.split(" ")[1];
  // console.log({ token });

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const user = jwt.verify(token, config.jwtSecret) as {
      _id: string;
      email: string;
      stripeCustomerId?: string;
    };
    req.user = user;
    return next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Alias for backward compatibility
export const auth = authenticateToken;
