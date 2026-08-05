import { SITE_URL } from "@/lib/site";

// NOTE ON STYLE: no em dashes anywhere in email copy. Use commas, periods or
// "and" instead. This is a deliberate house rule for all Admio email.

export interface WeeklyEmailProfile {
  id: string;
  name?: string | null;
  dream_college?: string | null;
  major_interest?: string | null;
  target_country?: string | null;
  grade?: string | null;
  xp?: number | null;
  streak?: number | null;
  profile_strength?: number | null;
  profile_strength_updated_at?: string | null;
  is_pro?: boolean | null;
  completed_activities?: { category?: string; name?: string }[] | null;
  selected_extracurricular_categories?: string[] | null;
  roadmaps?: { category: string; tasks: { done: boolean }[] }[] | null;
  essay_score?: number | null;
  awards?: { name?: string }[] | null;
}

// Deterministic pick so a user does not get the same opener two weeks running,
// and two users on the same week do not get identical mail.
function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function seedFor(userId: string, weekIndex: number): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0;
  return h + weekIndex;
}

/** ISO week number, used to rotate copy and to avoid double sends. */
export function weekIndexFor(date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - start) / (7 * 24 * 60 * 60 * 1000));
}

const OPENERS = [
  "Small steps add up. Here is where you stand this week.",
  "A quick check in on your application progress.",
  "Your weekly nudge, with the numbers that matter.",
  "Progress beats perfection. Here is your week in review.",
  "One week closer to your goal. Here is the snapshot.",
  "Consistency is what admissions officers notice. Here is yours.",
];

const SIGNOFFS = [
  "You have got this.",
  "Keep going, it compounds.",
  "One step this week is enough.",
  "Small and steady wins this.",
  "Proud of the progress. Keep at it.",
];

interface Nudge {
  title: string;
  body: string;
  ctaLabel: string;
  ctaPath: string;
}

/**
 * Picks the single most useful next action from real profile state. Ordered by
 * what actually unblocks the student, so the email never says something generic
 * when there is a concrete gap to close.
 */
function chooseNudge(p: WeeklyEmailProfile): Nudge {
  const completed = p.completed_activities?.length ?? 0;
  const selected = p.selected_extracurricular_categories?.length ?? 0;
  const roadmaps = p.roadmaps ?? [];
  const measured = Boolean(p.profile_strength_updated_at);

  if (!measured) {
    return {
      title: "Get your profile strength measured",
      body: "You have not run your profile score yet. It takes one click and shows exactly where you stand against a universal admissions rubric, plus what to fix first.",
      ctaLabel: "Score my profile",
      ctaPath: "/progress",
    };
  }

  if (selected === 0 && completed === 0) {
    return {
      title: "Pick your focus areas",
      body: "You have not chosen what to work on yet. Pick two or three categories and Admio will build the plan around them.",
      ctaLabel: "Choose my focus",
      ctaPath: "/extracurriculars",
    };
  }

  const activeRoadmap = roadmaps.find((r) => r.tasks.some((t) => !t.done));
  if (activeRoadmap) {
    const done = activeRoadmap.tasks.filter((t) => t.done).length;
    const total = activeRoadmap.tasks.length;
    const nextUp = total - done;
    return {
      title: `Your ${activeRoadmap.category} roadmap is ${Math.round((done / total) * 100)} percent done`,
      body: `You have ${done} of ${total} tasks checked off, so ${nextUp} to go. Knocking out one this week keeps the streak alive and moves the project forward.`,
      ctaLabel: "Open my roadmap",
      ctaPath: "/extracurriculars",
    };
  }

  if (selected > 0 && roadmaps.length === 0 && p.is_pro) {
    return {
      title: "Turn a focus area into a real plan",
      body: "You have picked your categories but have not built a roadmap yet. A roadmap breaks the work into weekly tasks with real competitions and deadlines.",
      ctaLabel: "Build my roadmap",
      ctaPath: "/extracurriculars",
    };
  }

  // Essay review is a Pro feature, so only point Pro users at it. Sending a
  // free user to a locked page is a dead end, not a nudge.
  if (!p.essay_score && p.is_pro) {
    return {
      title: "Get a second read on your essay",
      body: "Your personal statement is one of the few parts of the application you fully control. Paste a draft and get it scored with specific fixes.",
      ctaLabel: "Review my essay",
      ctaPath: "/essay",
    };
  }

  // Free users: point at things that actually raise their score and cost
  // nothing, rather than at a locked feature.
  if (!p.is_pro && (p.awards?.length ?? 0) === 0) {
    return {
      title: "Add any awards you have won",
      body: "Achievements are weighted heavily in your profile strength, and most students forget to log the ones they already have. Even school level awards count.",
      ctaLabel: "Add my awards",
      ctaPath: "/progress",
    };
  }

  if (completed > 0) {
    return {
      title: "Ready for what is next",
      body: `You have finished ${completed} ${completed === 1 ? "activity" : "activities"} through Admio. Generating a fresh set of recommendations will build on that instead of repeating it.`,
      ctaLabel: "See what is next",
      ctaPath: "/extracurriculars",
    };
  }

  return {
    title: "Keep the momentum going",
    body: "A short session this week is enough to stay ahead. Check your dashboard for the highest impact thing you can do right now.",
    ctaLabel: "Open my dashboard",
    ctaPath: "/dashboard",
  };
}

function goalLine(p: WeeklyEmailProfile): string {
  if (p.dream_college) return `Every step this week is one closer to ${p.dream_college}.`;
  if (p.major_interest) return `Building a profile that reads clearly as ${p.major_interest} is the goal.`;
  if (p.target_country) return `Building toward your applications in ${p.target_country}.`;
  return "Building a stronger application, one week at a time.";
}

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

export function buildWeeklyEmail(
  p: WeeklyEmailProfile,
  unsubscribeUrl: string,
  weekIndex = weekIndexFor()
): BuiltEmail {
  const seed = seedFor(p.id, weekIndex);
  const firstName = (p.name || "").trim().split(/\s+/)[0] || "there";
  const opener = pick(OPENERS, seed);
  const signoff = pick(SIGNOFFS, seed + 3);
  const nudge = chooseNudge(p);

  const streak = p.streak ?? 0;
  const strength = p.profile_strength ?? 0;
  const measured = Boolean(p.profile_strength_updated_at);
  const completed = p.completed_activities?.length ?? 0;

  const stats: { label: string; value: string }[] = [
    { label: "Profile strength", value: measured ? `${strength}%` : "Not measured" },
    { label: "Day streak", value: String(streak) },
    { label: "Activities done", value: String(completed) },
  ];

  const subject = measured && strength > 0
    ? `${firstName}, your profile is at ${strength}% this week`
    : `${firstName}, your weekly Admio check in`;

  const statCells = stats
    .map(
      (s) => `
        <td align="center" style="padding:14px 10px;background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
          <div style="font:700 22px/1.2 Helvetica,Arial,sans-serif;color:#F1F5F9;">${s.value}</div>
          <div style="font:400 12px/1.4 Helvetica,Arial,sans-serif;color:#94A3B8;padding-top:4px;">${s.label}</div>
        </td>`
    )
    .join('<td style="width:10px;"></td>');

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#080E1A;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${nudge.title}. ${goalLine(p)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080E1A;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding-bottom:22px;">
          <span style="font:800 20px/1 Helvetica,Arial,sans-serif;color:#F1F5F9;">Admio</span>
        </td></tr>
        <tr><td style="background:#0F1629;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">
          <p style="margin:0 0 6px;font:700 19px/1.4 Helvetica,Arial,sans-serif;color:#F1F5F9;">Hi ${firstName},</p>
          <p style="margin:0 0 20px;font:400 15px/1.6 Helvetica,Arial,sans-serif;color:#94A3B8;">${opener}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${statCells}</tr></table>

          <div style="height:1px;background:rgba(255,255,255,0.08);margin:24px 0;"></div>

          <p style="margin:0 0 8px;font:700 16px/1.4 Helvetica,Arial,sans-serif;color:#F1F5F9;">${nudge.title}</p>
          <p style="margin:0 0 20px;font:400 15px/1.6 Helvetica,Arial,sans-serif;color:#94A3B8;">${nudge.body}</p>

          <a href="${SITE_URL}${nudge.ctaPath}" style="display:inline-block;background:#00B4D8;color:#ffffff;text-decoration:none;font:600 15px/1 Helvetica,Arial,sans-serif;padding:13px 22px;border-radius:10px;">${nudge.ctaLabel}</a>

          <p style="margin:22px 0 0;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:#94A3B8;">${goalLine(p)} ${signoff}</p>
        </td></tr>
        <tr><td style="padding:18px 4px 0;font:400 12px/1.6 Helvetica,Arial,sans-serif;color:#64748B;">
          You are getting this because you have an Admio account.
          <a href="${unsubscribeUrl}" style="color:#94A3B8;">Unsubscribe from weekly emails</a>.
          Account and billing notices will still be sent.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `Hi ${firstName},

${opener}

Profile strength: ${measured ? `${strength}%` : "Not measured yet"}
Day streak: ${streak}
Activities done: ${completed}

${nudge.title}
${nudge.body}

${nudge.ctaLabel}: ${SITE_URL}${nudge.ctaPath}

${goalLine(p)} ${signoff}

Admio
You are getting this because you have an Admio account.
Unsubscribe from weekly emails: ${unsubscribeUrl}
Account and billing notices will still be sent.`;

  return { subject, html, text };
}
