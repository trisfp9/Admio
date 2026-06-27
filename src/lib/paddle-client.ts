import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// Client-side Paddle.js loader + checkout opener.
// Requires NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_PRICE_ID.

let paddlePromise: Promise<Paddle | undefined> | null = null;

export function isPaddleClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
  );
}

async function getPaddle(): Promise<Paddle | undefined> {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) return undefined;
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      token,
    });
  }
  return paddlePromise;
}

/**
 * Open the Paddle checkout overlay for the Pro subscription.
 * Throws "not_configured" if the client token / price id aren't set, so callers
 * can fall back gracefully.
 */
export async function openProCheckout(opts: { email?: string; userId: string }): Promise<void> {
  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
  const paddle = await getPaddle();
  if (!paddle || !priceId) throw new Error("not_configured");

  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    ...(opts.email ? { customer: { email: opts.email } } : {}),
    customData: { user_id: opts.userId },
    settings: {
      successUrl: `${window.location.origin}/dashboard?checkout=success`,
    },
  });
}
