import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";

const FS_API = "https://api.fastspring.com";

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;

  const { data: profile } = await supabase
    .from("profiles")
    .select("fastspring_account_id, is_pro")
    .eq("id", user.id)
    .single();

  if (!profile?.is_pro) {
    return NextResponse.json({ error: "No active subscription" }, { status: 403 });
  }

  if (!profile.fastspring_account_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  try {
    const fsAuth = Buffer.from(
      `${process.env.FASTSPRING_USERNAME}:${process.env.FASTSPRING_PASSWORD}`
    ).toString("base64");

    const res = await fetch(
      `${FS_API}/accounts/${profile.fastspring_account_id}/authenticate`,
      { headers: { Authorization: `Basic ${fsAuth}` } }
    );

    const data = await res.json();
    const portalUrl = data.accounts?.[0]?.url || data.url;

    if (!portalUrl) {
      throw new Error("No portal URL returned");
    }

    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    console.error("FastSpring billing portal error:", err);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
