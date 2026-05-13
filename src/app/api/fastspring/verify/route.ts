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
  const rateCheck = await checkRateLimit(user.id, "analyze");
  if (!rateCheck.success) return rateCheck.response!;

  const { data: profile } = await supabase
    .from("profiles")
    .select("fastspring_account_id, fastspring_subscription_id, is_pro")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.is_pro) return NextResponse.json({ is_pro: true });

  if (!profile.fastspring_subscription_id && !profile.fastspring_account_id) {
    return NextResponse.json({ is_pro: false, reason: "no_account" });
  }

  try {
    if (profile.fastspring_subscription_id) {
      const res = await fetch(
        `${FS_API}/subscriptions/${profile.fastspring_subscription_id}`,
        { headers: { Authorization: `Basic ${FS_AUTH}` } }
      );
      const data = await res.json();
      const sub = data.subscriptions?.[0] || data;

      if (sub.active || sub.state === "active") {
        await supabase.from("profiles").update({
          is_pro: true,
          ai_messages_this_month: 0,
          subscription_start: new Date().toISOString().split("T")[0],
        }).eq("id", user.id);
        return NextResponse.json({ is_pro: true });
      }
    }

    return NextResponse.json({ is_pro: false, reason: "no_active_subscription" });
  } catch (err) {
    console.error("FastSpring verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
