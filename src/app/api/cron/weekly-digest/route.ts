import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, emailConfigured, makeUnsubscribeToken } from "@/lib/email";
import { buildWeeklyEmail, weekIndexFor, type WeeklyEmailProfile } from "@/lib/email-templates";
import { SITE_URL } from "@/lib/site";

export const maxDuration = 60;
// Never prerender or cache: this has side effects and reads live data.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next caches fetch() inside route handlers, and supabase-js reads go through
// fetch. Without this the cron happily served a stale snapshot, which meant it
// would mail people who had already unsubscribed. Force every Supabase request
// to bypass the data cache.
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

/**
 * Weekly encouragement email. Triggered by the Vercel cron entry in
 * vercel.json. Composed entirely from profile data, so it costs no AI credits.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  // ?preview=1 renders the email in the browser without sending anything.
  // Development only, so it can never be used to probe production data.
  if (url.searchParams.get("preview") === "1" && process.env.NODE_ENV !== "production") {
    const sample: WeeklyEmailProfile = {
      id: "preview-user",
      name: "Alex",
      dream_college: "NUS",
      major_interest: "Biology/Pre-Med",
      profile_strength: 84,
      profile_strength_updated_at: new Date().toISOString(),
      streak: 12,
      is_pro: true,
      completed_activities: [{ category: "Research" }],
      selected_extracurricular_categories: ["Community Service"],
      roadmaps: [
        {
          category: "Community Service",
          tasks: [{ done: true }, { done: true }, { done: true }, { done: false }, { done: false }, { done: false }, { done: false }, { done: false }],
        },
      ],
      essay_score: 88,
    };
    const { html } = buildWeeklyEmail(sample, `${SITE_URL}/api/email/unsubscribe?u=preview&t=preview`);
    return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Vercel signs cron invocations with CRON_SECRET. Reject anything else so
  // this cannot be used to blast email from outside.
  // Trim both sides: env values pasted into a dashboard routinely pick up a
  // trailing newline or a leading tab, and an untrimmed compare turns that
  // into a silent 401 that looks like a wrong secret.
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization")?.trim();
  // Distinguish the two failure modes. Neither response reveals the secret,
  // but "not configured" vs "bad token" is the difference between a missing
  // Vercel env var and a shell variable that expanded to nothing.
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not set on the server. Add it in Vercel and redeploy." },
      { status: 401 }
    );
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: "Bad or missing bearer token. Check the Authorization header actually contains the secret." },
      { status: 401 }
    );
  }

  // Test controls, both requiring the secret above:
  //   ?dry=1        report who would receive what, send nothing
  //   ?to=<email>   send to this one address only, ignoring everyone else
  const dryRun = url.searchParams.get("dry") === "1";
  const onlyTo = (url.searchParams.get("to") || "").trim().toLowerCase();

  if (!emailConfigured() && !dryRun) {
    return NextResponse.json({ skipped: "RESEND_API_KEY not set" }, { status: 200 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false }, global: { fetch: noStoreFetch } }
  );

  const weekIndex = weekIndexFor();

  // Only people who finished onboarding and have not opted out.
  const { data: profiles, error } = await admin
    .from("profiles")
    .select(
      "id, name, dream_college, major_interest, target_country, grade, xp, streak, profile_strength, profile_strength_updated_at, is_pro, completed_activities, selected_extracurricular_categories, roadmaps, essay_score, email_opt_out, last_weekly_email_week"
    )
    .eq("onboarding_completed", true)
    .or("email_opt_out.is.null,email_opt_out.eq.false");

  if (error) {
    console.error("weekly-digest: profile query failed", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  // Map user id to email via the auth admin API (profiles has no email column).
  const emails = new Map<string, string>();
  for (let page = 1; page <= 10; page++) {
    const { data, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listErr || !data?.users?.length) break;
    for (const u of data.users) if (u.email) emails.set(u.id, u.email);
    if (data.users.length < 200) break;
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const wouldSend: { to: string; subject: string }[] = [];

  for (const p of profiles || []) {
    const to = emails.get(p.id);
    if (!to) {
      skipped++;
      continue;
    }

    // ?to= restricts the run to a single address for a safe live test.
    if (onlyTo && to.toLowerCase() !== onlyTo) {
      skipped++;
      continue;
    }

    // Idempotent: if this user already got this week's send, skip. Protects
    // against a retried or manually re-triggered cron double sending. A
    // targeted test (?to=) bypasses it so you can re-send to yourself.
    if (!onlyTo && p.last_weekly_email_week === weekIndex) {
      skipped++;
      continue;
    }

    const unsubscribeUrl = `${SITE_URL}/api/email/unsubscribe?u=${p.id}&t=${makeUnsubscribeToken(p.id)}`;
    const { subject, html, text } = buildWeeklyEmail(p as WeeklyEmailProfile, unsubscribeUrl, weekIndex);

    if (dryRun) {
      wouldSend.push({ to, subject });
      continue;
    }

    const ok = await sendEmail({ to, subject, html, text });
    if (ok) {
      sent++;
      // A targeted test should not consume the real weekly slot.
      if (!onlyTo) {
        await admin.from("profiles").update({ last_weekly_email_week: weekIndex }).eq("id", p.id);
      }
    } else {
      failed++;
    }
  }

  if (dryRun) {
    return NextResponse.json({ dryRun: true, weekIndex, wouldSend, count: wouldSend.length });
  }

  return NextResponse.json({ weekIndex, considered: profiles?.length ?? 0, sent, skipped, failed });
}
