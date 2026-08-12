import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import { callClaudeHaiku } from "@/lib/claude";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { user, supabase } = auth;
    const rateCheck = await checkRateLimit(user.id, "polish");
    if (!rateCheck.success) return rateCheck.response!;

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, ai_messages_this_month, ai_messages_used, dream_college, major_interest, polish_cache")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const messagesUsed = profile.is_pro ? profile.ai_messages_this_month : profile.ai_messages_used;
    const messagesMax = profile.is_pro ? 200 : 7;
    if (messagesUsed >= messagesMax) {
      return NextResponse.json({ error: "Message limit reached" }, { status: 403 });
    }

    let body: { activity?: { name?: string; role?: string; description?: string; hours_per_week?: string; years?: string } };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { activity } = body;
    if (!activity?.name) {
      return NextResponse.json({ error: "Activity name is required" }, { status: 400 });
    }

    const hasRole = !!activity.role;
    const hasDescription = !!activity.description && activity.description !== "not specified";
    const hasHours = !!activity.hours_per_week;
    const hasYears = !!activity.years;
    const detailCount = [hasRole, hasDescription, hasHours, hasYears].filter(Boolean).length;

    const systemPrompt = `You are an expert college application writer. Transform activity info into polished descriptions for admissions officers.

CRITICAL RULES:
- NEVER invent, fabricate, or assume any numbers, statistics, percentages, member counts, rankings, or achievements that the student did not explicitly provide.
- ONLY use facts the student actually gave you. If they said "led meetings", do NOT add "for 40+ members" or "increased participation by 60%" unless they told you that.
- If the student gave minimal info, write the best description you can with ONLY what they provided. Use strong verbs and structure, but do not add fictional details.
- Start with a strong action verb (Led, Founded, Designed, etc.)
- No filler words, no "I", no passive voice
- common_app must be ≤150 characters including spaces
- uc must be ≤350 characters including spaces
${detailCount <= 1 ? "\n- The student provided very little detail. In tips, tell them EXACTLY what info to add (numbers, role, hours, achievements) to get a stronger result. The descriptions will be generic without more detail. That is OK, do not make things up to compensate." : ""}
${profile.dream_college ? `\nStudent is targeting ${profile.dream_college}.` : ""}
${profile.major_interest ? `Intended major: ${profile.major_interest}.` : ""}

Respond with ONLY a raw JSON object. No markdown, no backticks, no explanation:
{"common_app":"...","uc":"...","tips":["..."]}`;

    const userMessage = [
      `Activity: ${activity.name}`,
      activity.role ? `Role: ${activity.role}` : null,
      activity.hours_per_week ? `Hours/week: ${activity.hours_per_week}` : null,
      activity.years ? `Duration: ${activity.years}` : null,
      activity.description ? `Details: ${activity.description}` : null,
    ].filter(Boolean).join("\n");

    const result = await callClaudeHaiku(systemPrompt, userMessage, 800);

    let parsed: { common_app?: string; uc?: string; tips?: string[] };
    const cleaned = result
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = {};
        }
      } else {
        parsed = {};
      }
    }

    const commonApp = typeof parsed.common_app === "string" ? parsed.common_app.slice(0, 150) : "";
    const uc = typeof parsed.uc === "string" ? parsed.uc.slice(0, 350) : "";
    let tips = Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [];

    if (detailCount <= 1) {
      tips = [
        "Add more detail to your activity (role, hours/week, duration, specific achievements) for a much stronger result.",
        ...tips,
      ].slice(0, 3);
    }

    if (!commonApp && !uc) {
      console.error("Polish returned empty. Raw:", result.slice(0, 500));
      return NextResponse.json({ error: "AI returned an empty response. Try again." }, { status: 500 });
    }

    const polishResult = { common_app: commonApp, uc, tips };

    // Save to polish_cache and increment message counter
    const existingCache = (profile.polish_cache as Record<string, unknown>) || {};
    const updatedCache = { ...existingCache, [activity.name]: polishResult };
    const updateField = profile.is_pro ? "ai_messages_this_month" : "ai_messages_used";
    await supabase
      .from("profiles")
      .update({ [updateField]: messagesUsed + 1, polish_cache: updatedCache })
      .eq("id", user.id);

    return NextResponse.json(polishResult);
  } catch (err) {
    console.error("Activity polish error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Polish failed: ${msg}` }, { status: 500 });
  }
}
