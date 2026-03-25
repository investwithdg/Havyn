import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminFirestore } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function updateSubscription(
  userId: string,
  data: Record<string, unknown>
) {
  await adminFirestore.doc(`users/${userId}`).set(
    {
      subscription: {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      },
    },
    { merge: true }
  );
}

function getFirebaseUserId(
  obj: Stripe.Checkout.Session | Stripe.Subscription | Stripe.Customer
): string | null {
  return (obj.metadata?.firebaseUserId as string) || null;
}

/**
 * Get the current period end from a subscription.
 * In newer Stripe API versions, this is on the subscription items.
 */
function getPeriodEnd(subscription: Stripe.Subscription): Date {
  // Try items first (newer API versions)
  const firstItem = subscription.items?.data?.[0];
  if (firstItem?.current_period_end) {
    return new Date(firstItem.current_period_end * 1000);
  }
  // Fallback: use cancel_at or ended_at
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  // Default to created + 30 days as a safe fallback
  return new Date(subscription.created * 1000 + 30 * 24 * 60 * 60 * 1000);
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  const fromMeta = getFirebaseUserId(customer);
  if (fromMeta) return fromMeta;

  // Fallback: query Firestore for the customer ID
  const snapshot = await adminFirestore
    .collection("users")
    .where("subscription.stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  return null;
}

function getSubscriptionId(invoice: Stripe.Invoice): string | null {
  // In newer Stripe API versions, subscription is under parent.subscription_details
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails?.subscription) return null;
  if (typeof subDetails.subscription === "string") return subDetails.subscription;
  return subDetails.subscription.id;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = getFirebaseUserId(session);
        if (!userId) break;

        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await updateSubscription(userId, {
          tier: "premium",
          status: subscription.status === "trialing" ? "trial" : "active",
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: session.customer as string,
          currentPeriodEnd: getPeriodEnd(subscription),
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId =
          getFirebaseUserId(subscription) ||
          (await getUserIdFromCustomer(customerId));
        if (!userId) break;

        const statusMap: Record<string, string> = {
          active: "active",
          trialing: "trial",
          past_due: "past_due",
          canceled: "cancelled",
          unpaid: "expired",
        };

        const periodEnd = getPeriodEnd(subscription);
        const isCanceled =
          subscription.status === "canceled" ||
          subscription.cancel_at_period_end;

        await updateSubscription(userId, {
          tier: isCanceled && new Date() > periodEnd ? "free" : "premium",
          status: statusMap[subscription.status] || subscription.status,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId =
          getFirebaseUserId(subscription) ||
          (await getUserIdFromCustomer(customerId));
        if (!userId) break;

        await updateSubscription(userId, {
          tier: "free",
          status: "expired",
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userId = await getUserIdFromCustomer(customerId);
        if (!userId) break;

        const subscriptionId = getSubscriptionId(invoice);
        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await updateSubscription(userId, {
            tier: "premium",
            status: "active",
            currentPeriodEnd: getPeriodEnd(subscription),
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userId = await getUserIdFromCustomer(customerId);
        if (!userId) break;

        await updateSubscription(userId, {
          status: "past_due",
        });
        break;
      }
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
