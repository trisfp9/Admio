import crypto from "crypto";

// Server-side Paddle (Billing API) helpers.
// API key + webhook secret are server-only secrets and must never be exposed to the client.

const PADDLE_API_BASE =
  process.env.PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

export function isPaddleConfigured(): boolean {
  return Boolean(process.env.PADDLE_API_KEY);
}

/** Minimal authenticated fetch against the Paddle API. Returns parsed JSON. */
async function paddleFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY is not set");

  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Paddle API ${res.status}: ${text.slice(0, 300)}`);
  }
  return json as Record<string, unknown>;
}

/**
 * Verify a Paddle webhook signature.
 * Header format: `ts=<unix>;h1=<hmac>`. The signed payload is `${ts}:${rawBody}`,
 * HMAC-SHA256 with the webhook secret. Uses a constant-time comparison.
 */
export function verifyPaddleWebhook(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((kv) => {
      const idx = kv.indexOf("=");
      return [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()];
    })
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Reject signatures older than 5 minutes to prevent replay.
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(h1, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Create a Paddle customer portal session so the user can manage their
 * subscription (cancel, update payment method, view invoices) on Paddle-hosted pages.
 * Returns the overview URL, or null if it can't be created.
 */
export async function createPortalSession(
  customerId: string,
  subscriptionId?: string | null
): Promise<string | null> {
  const body: Record<string, unknown> = {};
  if (subscriptionId) body.subscription_ids = [subscriptionId];

  const json = await paddleFetch(`/customers/${encodeURIComponent(customerId)}/portal-sessions`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = json.data as
    | { urls?: { general?: { overview?: string } } }
    | undefined;
  return data?.urls?.general?.overview ?? null;
}
