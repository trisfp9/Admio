import crypto from "crypto";

// Dodo Payments server helpers.
// API key + webhook secret are server-only secrets. Never expose to the client.

export const DODO_API_BASE =
  process.env.DODO_ENV === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";

export function isDodoConfigured(): boolean {
  return Boolean(process.env.DODO_API_KEY);
}

/**
 * Verify a Dodo webhook using the Standard Webhooks spec.
 * Headers: webhook-id, webhook-timestamp, webhook-signature.
 * signedContent = `${id}.${timestamp}.${rawBody}`; signature = base64(HMAC-SHA256(secretKey, signedContent)).
 * The secret is `whsec_<base64>`; the key is the base64-decoded portion after the prefix.
 * The webhook-signature header is a space-delimited list of `v1,<sig>` entries.
 */
export function verifyDodoWebhook(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null }
): boolean {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  const { id, timestamp, signature } = headers;
  if (!secret || !id || !timestamp || !signature) return false;

  // Replay protection: reject timestamps more than 5 minutes from now.
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > 300) return false;

  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret, "utf8");

  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", key).update(signedContent).digest("base64");

  // Header may contain multiple space-separated signatures like "v1,<sig> v1,<sig2>".
  const provided = signature.split(" ").map((part) => (part.includes(",") ? part.split(",")[1] : part));
  const expectedBuf = Buffer.from(expected);
  return provided.some((sig) => {
    const b = Buffer.from(sig);
    return b.length === expectedBuf.length && crypto.timingSafeEqual(b, expectedBuf);
  });
}

/** Minimal authenticated fetch against the Dodo API. */
export async function dodoFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey) throw new Error("DODO_API_KEY is not set");
  const res = await fetch(`${DODO_API_BASE}${path}`, {
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
  if (!res.ok) throw new Error(`Dodo API ${res.status}: ${text.slice(0, 300)}`);
  return json as Record<string, unknown>;
}
