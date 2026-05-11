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
      .select("is_pro, ai_messages_this_month, ai_messages_used, dream_college, major_interest")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const messagesUsed = profile.is_pro ? profile.ai_messages_this_month : profile.ai_messages_used;
    const messagesMax = profile.is_pro ? 400 : 7;
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

    const systemPrompt = `You are an expert college application writer. Transform activity info into polished descriptions for admissions officers.

Rules:
- Start with a strong action verb (Led, Founded, Designed, etc.)
- Quantify impact: numbers, rankings, percentages
- No filler words, no "I", no passive voice
- common_app must be ≤150 characters including spaces
- uc must be ≤350 characters including spaces

${profile.dream_college ? `Student is targeting ${profile.dream_college}.` : ""}
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

    // Parse JSON — handle markdown fences, extract JSON object
    let parsed: { common_app?: string; uc?: string; tips?: string[] };
    const cleaned = result.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```(?:json)?\n?/g, "").replace(/```/g, "");
    }).replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();

    try {
      // Try direct parse first
      parsed = JSON.parse(cleaned);
    } catch {
      // Try extracting JSON object
      const jsonMatch = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
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
    const tips = Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [];

    if (!commonApp && !uc) {
      console.error("Polish returned empty results. Raw:", result.slice(0, 500));
      return NextResponse.json({ error: "AI returned an empty response. Try again." }, { status: 500 });
    }

    // Increment message counter
    const updateField = profile.is_pro ? "ai_messages_this_month" : "ai_messages_used";
    await supabase
      .from("profiles")
      .update({ [updateField]: messagesUsed + 1 })
      .eq("id", user.id);

    return NextResponse.json({ common_app: commonApp, uc, tips });
  } catch (err) {
    console.error("Activity polish error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Polish failed: ${msg}` }, { status: 500 });
  }
}
