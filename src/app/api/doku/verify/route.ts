import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";

// Fallback activation — called when user returns from checkout.
// If the webhook already fired, profile.is_pro will be true.
// If not, we just tell the frontend to try again later.

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;
  const rateCheck = await checkRateLimit(user.id, "analyze");
  if (!rateCheck.success) return rateCheck.response!;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, doku_pending_invoice")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.is_pro) return NextResponse.json({ is_pro: true });

  // If there's a pending invoice, payment might still be processing
  if (profile.doku_pending_invoice) {
    return NextResponse.json({ is_pro: false, reason: "payment_processing" });
  }

  return NextResponse.json({ is_pro: false, reason: "no_payment" });
}
