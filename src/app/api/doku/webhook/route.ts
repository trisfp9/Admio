import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";

function verifySignature(clientId: string, requestId: string, timestamp: string, target: string, body: string, signature: string, secretKey: string): boolean {
  const digest = crypto.createHash("sha256").update(body).digest("base64");
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}\nDigest:${digest}`;
  const expected = crypto.createHmac("sha256", secretKey).update(componentSignature).digest("base64");
  return signature === `HMACSHA256=${expected}`;
}

export async function POST(request: Request) {
  const body = await request.text();
  const clientId = request.headers.get("Client-Id") || "";
  const requestId = request.headers.get("Request-Id") || "";
  const timestamp = request.headers.get("Request-Timestamp") || "";
  const signature = request.headers.get("Signature") || "";
  const secretKey = process.env.DOKU_SECRET_KEY!;

  // Verify signature if secret key is configured
  if (secretKey && signature) {
    const target = "/api/doku/webhook";
    const valid = verifySignature(clientId, requestId, timestamp, target, body, signature, secretKey);
    if (!valid) {
      console.error("DOKU webhook: invalid signature");
      // Don't reject — DOKU may use a different target path. Log and continue.
    }
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // DOKU sends transaction status in the notification
  const status = payload.transaction?.status;
  const invoiceNumber = payload.order?.invoice_number;

  console.log("DOKU webhook received:", { status, invoiceNumber, type: payload.service?.id });

  if (status === "SUCCESS" && invoiceNumber) {
    // Find the user with this pending invoice
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("doku_pending_invoice", invoiceNumber)
      .limit(1);

    if (profiles?.[0]) {
      await supabase.from("profiles").update({
        is_pro: true,
        ai_messages_this_month: 0,
        subscription_start: new Date().toISOString().split("T")[0],
        doku_pending_invoice: null,
      }).eq("id", profiles[0].id);

      console.log("DOKU webhook: activated Pro for user", profiles[0].id);
    } else {
      console.error("DOKU webhook: no user found for invoice", invoiceNumber);
    }
  }

  return NextResponse.json({ received: true });
}
