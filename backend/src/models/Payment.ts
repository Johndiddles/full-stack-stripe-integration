import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status:
    | "succeeded"
    | "processing"
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "requires_capture"
    | "canceled";
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
    },
    status: {
      type: String,
      enum: [
        "succeeded",
        "processing",
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "requires_capture",
        "canceled",
      ],
      default: "requires_payment_method",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ subscriptionId: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
