import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("X-FS-Signature");
  const secret = process.env.FASTSPRING_WEBHOOK_SECRET;

  if (secret && signature) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("base64");

    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const payload = JSON.parse(body);
  const supabase = createAdminClient();

  for (const event of payload.events || []) {
    const type = event.type;
    const data = event.data;
    const userId = data?.tags?.userId;

    switch (type) {
      case "subscription.activated": {
        if (userId) {
          await supabase.from("profiles").update({
            is_pro: true,
            ai_messages_this_month: 0,
            subscription_start: new Date().toISOString().split("T")[0],
            fastspring_account_id: data.account,
            fastspring_subscription_id: data.id,
          }).eq("id", userId);
        }
        break;
      }

      case "subscription.deactivated": {
        const subId = data.id;
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("fastspring_subscription_id", subId)
          .limit(1);

        if (profiles?.[0]) {
          await supabase.from("profiles").update({
            is_pro: false,
          }).eq("id", profiles[0].id);
        }
        break;
      }

      case "subscription.charge.completed": {
        const subId = data.id || data.subscription;
        if (subId) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id")
            .eq("fastspring_subscription_id", subId)
            .limit(1);

          if (profiles?.[0]) {
            await supabase.from("profiles").update({
              ai_messages_this_month: 0,
            }).eq("id", profiles[0].id);
          }
        }
        break;
      }
    }
  }

  return NextResponse.json({ received: true });
}
