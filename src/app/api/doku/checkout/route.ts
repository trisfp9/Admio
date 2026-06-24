import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import crypto from "crypto";

const DOKU_API = process.env.DOKU_ENV === "production"
  ? "https://api.doku.com"
  : "https://api-sandbox.doku.com";

function generateSignature(clientId: string, requestId: string, timestamp: string, target: string, body: string, secretKey: string) {
  const digest = crypto.createHash("sha256").update(body).digest("base64");
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}\nDigest:${digest}`;
  const hmac = crypto.createHmac("sha256", secretKey).update(componentSignature).digest("base64");
  return `HMACSHA256=${hmac}`;
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;
  const rateCheck = await checkRateLimit(user.id, "general");
  if (!rateCheck.success) return rateCheck.response!;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.is_pro) return NextResponse.json({ error: "Already subscribed" }, { status: 400 });

  try {
    const clientId = process.env.DOKU_CLIENT_ID!;
    const secretKey = process.env.DOKU_SECRET_KEY!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const invoiceNumber = `ADMIO-PRO-${user.id.slice(0, 8)}-${Date.now()}`;
    const target = "/checkout/v1/payment";

    const body = JSON.stringify({
      order: {
        amount: 150000,
        invoice_number: invoiceNumber,
        currency: "IDR",
        callback_url: `${appUrl}/dashboard?checkout=success`,
        callback_url_cancel: `${appUrl}/pricing?checkout=cancelled`,
        language: "EN",
        auto_redirect: true,
        disable_retry_payment: false,
        line_items: [
          {
            id: "admio-pro",
            name: "Admio Pro - Monthly",
            quantity: 1,
            price: 150000,
            category: "subscription",
          },
        ],
      },
      payment: {
        payment_due_date: 60,
        payment_method_types: [
          "CREDIT_CARD",
          "QRIS",
          "VIRTUAL_ACCOUNT_BCA",
          "VIRTUAL_ACCOUNT_MANDIRI",
          "VIRTUAL_ACCOUNT_BRI",
          "VIRTUAL_ACCOUNT_BNI",
          "EMONEY_SHOPEEPAY",
          "EMONEY_OVO",
          "EMONEY_DANA",
        ],
      },
      customer: {
        id: user.id,
        email: user.email || "",
        name: user.email?.split("@")[0] || "User",
      },
      additional_info: {
        override_notification_url: `${appUrl}/api/doku/webhook`,
      },
    });

    const signature = generateSignature(clientId, requestId, timestamp, target, body, secretKey);

    const res = await fetch(`${DOKU_API}${target}`, {
      method: "POST",
      headers: {
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: signature,
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok || !data.response?.payment?.url) {
      console.error("DOKU checkout error:", res.status, data);
      return NextResponse.json({
        error: "DOKU checkout failed",
        detail: data,
        dokuStatus: res.status,
      }, { status: 500 });
    }

    // Store the invoice number so webhook can match it to the user
    await supabase.from("profiles").update({
      doku_pending_invoice: invoiceNumber,
    }).eq("id", user.id);

    return NextResponse.json({ url: data.response.payment.url });
  } catch (err) {
    console.error("DOKU checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
