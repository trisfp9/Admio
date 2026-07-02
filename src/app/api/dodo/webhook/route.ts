import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { verifyDodoWebhook } from "@/lib/dodo";

// Dodo Payments webhook (Standard Webhooks). Verifies the signature, then syncs
// subscription state into profiles.
export const dynamic = "force-dynamic";

// Subscription statuses that should grant Pro access.
const PRO_STATUSES = new Set(["active", "on_hold"]); // on_hold = payment retry grace

export async function POST(request: Request) {
  const rawBody = await request.text();

  const valid = verifyDodoWebhook(rawBody, {
    id: request.headers.get("webhook-id"),
    timestamp: request.headers.get("webhook-timestamp"),
    signature: request.headers.get("webhook-signature"),
  });
  if (!valid) {
    console.error("Dodo webhook: invalid or missing signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type || "";
  const data = event.data || {};
  console.log("Dodo webhook:", type, JSON.stringify(data).slice(0, 500));

  // Only act on subscription lifecycle events.
  if (!type.startsWith("subscription.")) {
    return NextResponse.json({ received: true, ignored: type });
  }

  // Defensive field extraction (Dodo nests customer + metadata under data).
  const subscriptionId =
    (data.subscription_id as string) || (data.id as string) || null;
  const customer = (data.customer as { customer_id?: string; email?: string } | undefined) || undefined;
  const customerId = customer?.customer_id || (data.customer_id as string) || null;
  const metadata = (data.metadata as { user_id?: string } | undefined) || undefined;
  const userId = metadata?.user_id || null;
  const status = (data.status as string) || null;
  const nextBilling =
    (data.next_billing_date as string) || (data.next_billed_at as string) || null;

  const supabase = createAdminClient();

  // Resolve the profile: prefer the user_id we attach at checkout, then customer id.
  let profileId: string | null = null;
  if (userId) {
    const { data: p } = await supabase.from("profiles").select("id").eq("id", userId).single();
    if (p) profileId = p.id;
  }
  if (!profileId && customerId) {
    const { data: p } = await supabase
      .from("profiles")
      .select("id")
      .eq("dodo_customer_id", customerId)
      .limit(1)
      .maybeSingle();
    if (p) profileId = p.id;
  }

  if (!profileId) {
    console.error("Dodo webhook: no matching profile", { type, subscriptionId, customerId, userId });
    return NextResponse.json({ received: true, unmatched: true });
  }

  const isPro = status ? PRO_STATUSES.has(status) : false;

  const { data: existing } = await supabase
    .from("profiles")
    .select("subscription_start")
    .eq("id", profileId)
    .single();

  const update: Record<string, unknown> = {
    is_pro: isPro,
    subscription_status: status,
    dodo_subscription_id: subscriptionId,
    dodo_customer_id: customerId,
    subscription_renews_at: nextBilling,
  };
  if (isPro && !existing?.subscription_start) {
    update.subscription_start = new Date().toISOString().split("T")[0];
  }
  if (type === "subscription.active") {
    update.ai_messages_this_month = 0;
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", profileId);
  if (error) {
    console.error("Dodo webhook: DB update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  console.log("Dodo webhook handled:", { type, profileId, status, isPro });
  return NextResponse.json({ received: true });
}
