import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import { dodoFetch, isDodoConfigured } from "@/lib/dodo";

// Returns a Dodo-hosted customer portal link where the user can manage their
// subscription: cancel, update payment method, and view invoices.
export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;

  const rateCheck = await checkRateLimit(user.id, "general");
  if (!rateCheck.success) return rateCheck.response!;

  if (!isDodoConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dodo_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.dodo_customer_id) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
  }

  try {
    const res = await dodoFetch(
      `/customers/${encodeURIComponent(profile.dodo_customer_id)}/customer-portal/session`,
      { method: "POST", body: JSON.stringify({}) }
    );
    const url = (res.link as string) || null;
    if (!url) return NextResponse.json({ error: "Could not open billing portal." }, { status: 502 });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Dodo portal error:", err);
    return NextResponse.json({ error: "Could not open billing portal." }, { status: 500 });
  }
}
