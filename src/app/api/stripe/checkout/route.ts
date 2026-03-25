import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminFirestore, adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const email = decodedToken.email;

    const { priceId } = await req.json();
    const selectedPriceId =
      priceId ||
      process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!selectedPriceId) {
      return NextResponse.json(
        { error: "No price ID configured" },
        { status: 500 }
      );
    }

    // Look up or create Stripe customer
    const userDoc = await adminFirestore.doc(`users/${userId}`).get();
    let stripeCustomerId = userDoc.data()?.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: { firebaseUserId: userId },
      });
      stripeCustomerId = customer.id;

      // Store customer ID in Firestore
      await adminFirestore.doc(`users/${userId}`).set(
        { subscription: { stripeCustomerId } },
        { merge: true }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/?checkout=cancel`,
      metadata: { firebaseUserId: userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
