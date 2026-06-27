import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import { createPortalSession, isPaddleConfigured } from "@/lib/paddle";

// Returns a Paddle-hosted customer portal URL where the user can manage their
// subscription: cancel, update payment method, and view/download invoices.
export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;

  const rateCheck = await checkRateLimit(user.id, "general");
  if (!rateCheck.success) return rateCheck.response!;

  if (!isPaddleConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("paddle_customer_id, paddle_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.paddle_customer_id) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
  }

  try {
    const url = await createPortalSession(profile.paddle_customer_id, profile.paddle_subscription_id);
    if (!url) return NextResponse.json({ error: "Could not open billing portal." }, { status: 502 });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Paddle portal error:", err);
    return NextResponse.json({ error: "Could not open billing portal." }, { status: 500 });
  }
}
