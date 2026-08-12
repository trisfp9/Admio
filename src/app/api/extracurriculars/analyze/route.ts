import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/ratelimit";
import { callClaude, buildProfilePrompt } from "@/lib/claude";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, supabase } = auth;
  const rateCheck = await checkRateLimit(user.id, "analyze");
  if (!rateCheck.success) return rateCheck.response!;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Categories the user has already committed to. These are carried over
  // verbatim so a regenerate never invalidates the current selection.
  const body = await request.json().catch(() => ({} as { keep?: unknown }));
  const requestedKeep = Array.isArray((body as { keep?: unknown }).keep)
    ? ((body as { keep: unknown[] }).keep.filter((c) => typeof c === "string") as string[])
    : [];
  const existingRecs = (profile.extracurricular_recommendations || []) as {
    category?: string;
  }[];
  const keptRecs = existingRecs.filter(
    (r) => r.category && requestedKeep.includes(r.category)
  );
  const keptCategories = keptRecs.map((r) => r.category as string);

  // Categories the student already finished, plus whatever was suggested last
  // time. Regenerating should move them forward, not hand back the same list.
  const completedCategories: string[] = Array.from(
    new Set(
      (profile.completed_activities || [])
        .map((a: { category?: string }) => a.category)
        .filter(Boolean) as string[]
    )
  );
  const previousCategories: string[] = Array.from(
    new Set(
      (profile.extracurricular_recommendations || [])
        .map((r: { category?: string }) => r.category)
        .filter(Boolean) as string[]
    )
  ).filter((c) => !completedCategories.includes(c) && !keptCategories.includes(c));

  // Kept categories occupy slots in the final list, so only ask for the rest.
  const wanted = Math.max(3, 8 - keptRecs.length);

  const keepRule = keptCategories.length
    ? `
- KEEPING (the student is actively working on these; they stay in the list and you must NOT return them again, nor a near-duplicate of them): ${keptCategories.join(", ")}. Suggest categories that COMPLEMENT these rather than overlap.`
    : "";

  const freshnessRules = `

FRESHNESS RULES, these override everything else when they conflict:${keepRule}
${completedCategories.length
  ? `- ALREADY COMPLETED (never suggest these again, in any rewording): ${completedCategories.join(", ")}.
- Instead propose the natural NEXT STEP up from that work: bigger scope, leadership rather than participation, regional/national reach rather than local, creating rather than consuming. If they finished a local research project, suggest publishing or competing nationally, not another local project.`
  : "- The student has not completed anything through Admio yet."}
${previousCategories.length
  ? `- PREVIOUSLY SUGGESTED (avoid repeating unless one is genuinely the strongest remaining fit; if you keep one, materially raise its ambition and say in the explanation how it differs): ${previousCategories.join(", ")}.`
  : ""}
- Aim for at least half the list to be categories the student has not seen before.`;

  try {
    const systemPrompt = buildProfilePrompt(profile) + freshnessRules + `

You are analyzing this student's profile to recommend extracurricular categories.

Return ONLY valid JSON (no markdown, no backticks) as an array of exactly ${wanted} objects with this exact shape:
[
  {
    "category": "Category Name",
    "explanation": "2-3 sentence explanation of why this category fits this student specifically.",
    "effort_level": "Low" | "Medium" | "High",
    "impact_level": "Medium" | "High" | "Very High",
    "example": "One generic example sentence (no specific competition names).",
    "estimated_time": "Realistic time range to achieve a meaningful result, e.g. '1-2 months', '3-6 months', '6-12 months', '1-2 years'"
  }
]

Tailor categories to the student's major interest and goals. Be specific about WHY each category matters for their application. The estimated_time should reflect how long it typically takes to build a presentable body of work in this category for a college application, not how long a single task takes.`;

    const result = await callClaude(systemPrompt, "Analyze my profile and recommend extracurricular categories.");

    let recommendations;
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = JSON.parse(result);
      }
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response. Please try again." }, { status: 500 });
    }

    // Put the kept categories back at the front, and drop any the model
    // returned that duplicate them (or each other) despite being told not to.
    const seen = new Set(keptCategories);
    const freshRecs = (Array.isArray(recommendations) ? recommendations : []).filter(
      (r: { category?: string }) => {
        if (!r?.category || seen.has(r.category)) return false;
        seen.add(r.category);
        return true;
      }
    );
    const merged = [...keptRecs, ...freshRecs];

    // Save to profile
    await supabase
      .from("profiles")
      .update({ extracurricular_recommendations: merged })
      .eq("id", user.id);

    return NextResponse.json({ recommendations: merged });
  } catch (err) {
    console.error("EC analysis error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message.includes("API") ? message : "Analysis failed. Please try again." }, { status: 500 });
  }
}
