import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";

const FS_API = "https://api.fastspring.com";
const FS_AUTH = Buffer.from(
  `${process.env.FASTSPRING_USERNAME}:${process.env.FASTSPRING_PASSWORD}`
).toString("base64");

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;
  const rateCheck = await checkRateLimit(user.id, "general");
  if (!rateCheck.success) return rateCheck.response!;

  const { data: profile } = await supabase
    .from("profiles")
    .select("fastspring_account_id, is_pro")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.is_pro) return NextResponse.json({ error: "Already subscribed" }, { status: 400 });

  try {
    const sessionPayload: Record<string, unknown> = {
      items: [{ product: "admio-pro", quantity: 1 }],
      tags: { userId: user.id },
      contact: {
        email: user.email,
        firstName: user.email?.split("@")[0] || "User",
        lastName: " ",
      },
    };

    if (profile.fastspring_account_id) {
      sessionPayload.account = profile.fastspring_account_id;
    }

    const res = await fetch(`${FS_API}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${FS_AUTH}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionPayload),
    });

    const data = await res.json();
    if (!res.ok || !data.id) {
      console.error("FastSpring session error:", data);
      throw new Error("Failed to create checkout session");
    }

    if (data.account && !profile.fastspring_account_id) {
      await supabase
        .from("profiles")
        .update({ fastspring_account_id: data.account })
        .eq("id", user.id);
    }

    const storefront = process.env.FASTSPRING_STOREFRONT!;
    const checkoutUrl = `https://${storefront}/session/${data.id}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
