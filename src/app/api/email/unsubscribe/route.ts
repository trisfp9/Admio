import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUnsubscribeToken } from "@/lib/email";

export const dynamic = "force-dynamic";

function page(title: string, body: string, ok: boolean) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#080E1A;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:460px;margin:14vh auto;padding:32px;background:#0F1629;border:1px solid rgba(255,255,255,0.08);border-radius:16px;text-align:center;">
    <div style="font:800 20px/1 Helvetica,Arial,sans-serif;color:#F1F5F9;margin-bottom:18px;">Admio</div>
    <h1 style="font:700 19px/1.4 Helvetica,Arial,sans-serif;color:${ok ? "#F1F5F9" : "#F1F5F9"};margin:0 0 10px;">${title}</h1>
    <p style="font:400 15px/1.6 Helvetica,Arial,sans-serif;color:#94A3B8;margin:0 0 22px;">${body}</p>
    <a href="https://admio.io" style="display:inline-block;background:#00B4D8;color:#fff;text-decoration:none;font:600 15px/1 Helvetica,Arial,sans-serif;padding:12px 20px;border-radius:10px;">Back to Admio</a>
  </div>
</body></html>`,
    { status: ok ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

/** One click unsubscribe. No login required, so the link carries an HMAC. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("u") || "";
  const token = searchParams.get("t") || "";

  if (!userId || !verifyUnsubscribeToken(userId, token)) {
    return page("That link is not valid", "Please use the unsubscribe link from a recent Admio email, or change your preference from your profile page.", false);
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
  const { error } = await admin.from("profiles").update({ email_opt_out: true }).eq("id", userId);
  if (error) {
    return page("Something went wrong", "We could not update your preference just now. Please try again in a moment.", false);
  }

  return page(
    "You are unsubscribed",
    "You will not get weekly progress emails any more. Account and billing notices will still be sent, since those are part of your account. Changed your mind? Turn them back on any time under Email Preferences on your profile page."
  , true);
}

// Some mail clients fire a POST for List-Unsubscribe-Post. Treat it the same.
export async function POST(request: Request) {
  return GET(request);
}
