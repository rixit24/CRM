import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== "test") {
  // Don't throw at import time in dev — lets the rest of the app run
  // before billing env vars are configured — but make it loud.
  console.warn(
    "[stripe] STRIPE_SECRET_KEY is not set. Billing routes will fail until it is."
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});
