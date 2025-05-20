import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  try {
    const { card } = await req.json();

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: card.number,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvc: card.cvc,
      },
    });

    return NextResponse.json({ paymentMethod });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment method",
      },
      { status: 500 }
    );
  }
}
