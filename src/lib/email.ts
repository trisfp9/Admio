import crypto from "crypto";

// Thin wrapper over Resend's REST API. No SDK dependency: it is a single POST
// and this keeps the bundle (and the dependency surface) small.
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const EMAIL_FROM = process.env.EMAIL_FROM || "Admio <hello@admio.io>";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends one email. Returns false instead of throwing so a single bad address
 * can never abort a whole cron run.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Not configured (local dev, or before the domain is verified). No-op.
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      console.error("Resend send failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend send threw", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Unsubscribe tokens
// ---------------------------------------------------------------------------
// One-click unsubscribe must work without a login, so the link carries a token
// derived from the user id. HMAC (not a raw id) so nobody can unsubscribe
// somebody else by guessing.

function unsubscribeSecret(): string {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.SUPABASE_SECRET_KEY || "insecure-dev-secret";
}

export function makeUnsubscribeToken(userId: string): string {
  return crypto.createHmac("sha256", unsubscribeSecret()).update(userId).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = makeUnsubscribeToken(userId);
  const a = Buffer.from(expected);
  const b = Buffer.from(token || "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
