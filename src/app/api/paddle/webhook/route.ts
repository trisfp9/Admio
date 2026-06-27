import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { verifyPaddleWebhook } from "@/lib/paddle";

// Paddle Billing webhook handler.
// Verifies the Paddle-Signature header, then syncs subscription state into profiles.
export const dynamic = "force-dynamic";

// Statuses that should grant Pro access (past_due kept as a short grace period).
const PRO_STATUSES = new Set(["active", "trialing", "past_due"]);

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("Paddle-Signature");

  if (!verifyPaddleWebhook(rawBody, signature)) {
    console.error("Paddle webhook: invalid or missing signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event_type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type;
  const data = event.data;
  if (!eventType || !data || typeof data !== "object") {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  // We only act on subscription lifecycle events.
  if (!eventType.startsWith("subscription.")) {
    return NextResponse.json({ received: true, ignored: eventType });
  }

  const subscriptionId = typeof data.id === "string" ? data.id : null;
  const customerId = typeof data.customer_id === "string" ? data.customer_id : null;
  const status = typeof data.status === "string" ? data.status : null;
  const nextBilledAt = typeof data.next_billed_at === "string" ? data.next_billed_at : null;
  const customData = (data.custom_data as { user_id?: string } | null) || null;
  const userId = customData && typeof customData.user_id === "string" ? customData.user_id : null;

  const supabase = createAdminClient();

  // Resolve which profile this subscription belongs to: prefer the user_id we
  // attached at checkout, fall back to a stored Paddle customer id.
  let profileId: string | null = null;
  if (userId) {
    const { data: p } = await supabase.from("profiles").select("id").eq("id", userId).single();
    if (p) profileId = p.id;
  }
  if (!profileId && customerId) {
    const { data: p } = await supabase
      .from("profiles")
      .select("id")
      .eq("paddle_customer_id", customerId)
      .limit(1)
      .maybeSingle();
    if (p) profileId = p.id;
  }

  if (!profileId) {
    console.error("Paddle webhook: no matching profile", { eventType, subscriptionId, customerId, userId });
    // Acknowledge so Paddle doesn't retry indefinitely; nothing we can do.
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
    paddle_subscription_id: subscriptionId,
    paddle_customer_id: customerId,
    subscription_renews_at: nextBilledAt,
  };

  // Set "member since" on first activation only.
  if (isPro && !existing?.subscription_start) {
    update.subscription_start = new Date().toISOString().split("T")[0];
  }
  // Reset the monthly AI message counter when a subscription (re)activates.
  if (eventType === "subscription.activated" || eventType === "subscription.created") {
    update.ai_messages_this_month = 0;
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", profileId);
  if (error) {
    console.error("Paddle webhook: DB update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  console.log("Paddle webhook handled:", { eventType, profileId, status, isPro });
  return NextResponse.json({ received: true });
}
