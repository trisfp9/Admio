import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import { dodoFetch, isDodoConfigured } from "@/lib/dodo";

// Creates a Dodo Payments hosted checkout session for the Admio Pro subscription.
export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;

  const rateCheck = await checkRateLimit(user.id, "general");
  if (!rateCheck.success) return rateCheck.response!;

  if (!isDodoConfigured() || !process.env.DODO_PRODUCT_ID) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, name")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.is_pro) return NextResponse.json({ error: "Already subscribed" }, { status: 400 });

  // Prefer the real request origin (the domain the user is on) so the return URL
  // never points at a stale deployment. Fall back to configured/hardcoded prod URL.
  const appUrl =
    request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://admio.io";

  try {
    const res = await dodoFetch("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        product_cart: [{ product_id: process.env.DODO_PRODUCT_ID, quantity: 1 }],
        customer: {
          email: user.email || "",
          name: profile.name || user.email?.split("@")[0] || "Student",
        },
        // user_id flows back on the subscription webhook so we can match the buyer.
        metadata: { user_id: user.id },
        return_url: `${appUrl}/dashboard?checkout=success`,
      }),
    });

    const url = (res.checkout_url as string) || null;
    if (!url) {
      console.error("Dodo checkout: no checkout_url", res);
      return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
    }
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Dodo checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
