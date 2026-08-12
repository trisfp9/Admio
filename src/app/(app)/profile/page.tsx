"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { createBrowserClient } from "@/lib/supabase";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { User, Crown, Trash2, Shield, Mail, Lock, LogOut, ChevronDown, ChevronUp, Settings, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const GRADES = ["9th Grade", "10th Grade", "11th Grade", "12th Grade"];
const AIMING = ["Reach-focused", "Balanced", "Safety-focused"];
const MAJORS = ["Engineering", "Biology/Pre-Med", "Business", "CS/Tech", "Humanities", "Arts", "Law", "Medicine", "Other"];
const GPA_RANGES = ["Below 2.5", "2.5 - 3.0", "3.0 - 3.5", "3.5 - 3.8", "3.8 - 4.0", "4.0+"];
const EC_INTERESTS = ["Sports", "Arts", "Tech", "Research", "Community Service", "Business", "Writing", "Music", "Science", "Math", "Other"];
const TIME_OPTIONS = ["Less than 2 hours", "2-5 hours", "5-10 hours", "10+ hours"];

const PROFILE_FIELDS = [
  "name", "grade", "country", "target_country", "dream_college",
  "aiming_level", "major_interest", "gpa_range", "test_scores",
  "time_available", "extracurricular_interests",
] as const;

export default function ProfilePage() {
  const { profile, refreshProfile, user, loading, session } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [deleting, setDeleting] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);
  const [saving, setSaving] = useState(false);

  // Account settings state
  const [emailOpen, setEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Weekly email preference. Optimistic so the switch feels instant, reverted
  // if the write fails.
  const [emailOptOut, setEmailOptOut] = useState<boolean>(Boolean(profile?.email_opt_out));
  const [savingEmailPref, setSavingEmailPref] = useState(false);

  useEffect(() => {
    setEmailOptOut(Boolean(profile?.email_opt_out));
  }, [profile?.email_opt_out]);

  const toggleWeeklyEmails = async () => {
    if (!profile) return;
    const next = !emailOptOut;
    setEmailOptOut(next);
    setSavingEmailPref(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ email_opt_out: next })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success(next ? "Weekly emails turned off." : "Weekly emails turned on.");
      await refreshProfile();
    } catch {
      setEmailOptOut(!next);
      toast.error("Could not save that preference. Please try again.");
    } finally {
      setSavingEmailPref(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const isDirty = useMemo(() => {
    if (!profile || !localProfile) return false;
    return PROFILE_FIELDS.some((f) => JSON.stringify(profile[f]) !== JSON.stringify(localProfile[f]));
  }, [profile, localProfile]);

  const lastEditedAt = profile?.profile_last_edited_at ?? null;
  const canEdit = useMemo(() => {
    if (!lastEditedAt) return true;
    const msSince = Date.now() - new Date(lastEditedAt).getTime();
    return msSince >= 7 * 24 * 60 * 60 * 1000;
  }, [lastEditedAt]);

  const nextEditDate = useMemo(() => {
    if (!lastEditedAt) return null;
    const next = new Date(new Date(lastEditedAt).getTime() + 7 * 24 * 60 * 60 * 1000);
    return next.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [lastEditedAt]);

  const updateField = (field: string, value: unknown) => {
    setLocalProfile((p) => p ? { ...p, [field]: value } : p);
  };

  const handleSave = async () => {
    if (!user || !localProfile || !isDirty) return;
    if (!canEdit) {
      toast.error(`You can update your profile once per week. Next edit available ${nextEditDate}.`);
      return;
    }
    setSaving(true);
    try {
      const updates: Record<string, unknown> = { profile_last_edited_at: new Date().toISOString() };
      for (const f of PROFILE_FIELDS) {
        updates[f] = localProfile[f];
      }
      updates.college_list_cache = null;
      updates.profile_strength_updated_at = null;
      updates.extracurricular_recommendations = null;
      updates.ai_scholarships_cache = null;
      updates.ai_competitions_cache = null;
      updates.daily_tip_cache = null;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;

      await refreshProfile();

      if (session?.access_token) {
        toast.success("Profile saved! Recalculating your profile strength...");
        try {
          await fetch("/api/profile-strength", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          await refreshProfile();
          toast.success("Profile strength updated!", { duration: 2000 });
        } catch {
          toast.success("Profile saved! Profile strength will update shortly.");
        }
      } else {
        toast.success("Profile saved!");
      }
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will permanently delete your account and all data.")) return;
    setDeleting(true);
    try {
      // Delete profile (cascade deletes saved_items, chat_messages)
      await supabase.from("profiles").delete().eq("id", user!.id);
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      toast.error("Failed to delete account.");
    }
    setDeleting(false);
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Confirmation email sent! Check your inbox to verify the new address.");
      setEmailOpen(false);
      setNewEmail("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update email";
      toast.error(message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully.");
      setPasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || !localProfile) {
    return (
      <div className="space-y-8 max-w-2xl">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="glass-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-text-primary">Profile</h1>
          <p className="text-text-muted mt-1">Manage your information and settings.</p>
        </div>
        <div className="flex items-center gap-2">
          {localProfile.is_pro ? (
            <Badge variant="pop"><Crown className="w-3 h-3 mr-1" /> Pro</Badge>
          ) : (
            <Link href="/pricing"><Badge variant="accent">Free Plan</Badge></Link>
          )}
        </div>
      </div>

      {/* Profile Strength summary. Details and recalculation live in the Progress tab */}
      <Link href="/progress" className="block">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="glass-card p-6 hover:border-purple/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple" />
              <h2 className="font-heading font-semibold text-text-primary">Profile Strength</h2>
            </div>
            <span className="font-heading font-bold text-2xl text-text-primary">
              {localProfile.profile_strength_updated_at ? `${localProfile.profile_strength}%` : "-"}
            </span>
          </div>
          <ProgressBar
            value={localProfile.profile_strength_updated_at ? localProfile.profile_strength : 0}
            variant={localProfile.profile_strength >= 70 ? "pop" : localProfile.profile_strength >= 40 ? "accent" : "purple"}
            size="md"
          />
          <p className="text-text-muted text-xs mt-2">
            {localProfile.profile_strength_updated_at
              ? "Update grades, activities, and awards in the Progress tab to improve this score."
              : "Not yet graded. Head to the Progress tab and hit Recalculate for your first AI-scored assessment."}
          </p>
          <p className="text-text-muted/50 text-[11px] mt-2 italic">
            AI-estimated. Real admissions outcomes depend on factors not visible here.
          </p>
        </motion.div>
      </Link>

      {/* Account Settings */}
      <div className="glass-card p-6 space-y-1">
        <h2 className="font-heading font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple" /> Account Settings
        </h2>

        {/* Current email (read-only display) */}
        <div className="flex items-center justify-between py-3 border-b border-white/8">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-text-muted" />
            <div>
              <p className="text-sm text-text-primary">Email address</p>
              <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { setEmailOpen((o) => !o); setPasswordOpen(false); }}
            className="text-xs text-purple hover:underline flex items-center gap-1"
          >
            Change {emailOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {emailOpen && (
          <form onSubmit={handleEmailChange} className="pt-3 pb-2 space-y-3">
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-purple/50 transition-colors text-sm"
            />
            <p className="text-text-muted/60 text-xs">A confirmation link will be sent to the new address.</p>
            <div className="flex gap-2">
              <Button type="submit" variant="purple" size="sm" loading={emailLoading}>
                Send confirmation
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEmailOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Password */}
        <div className="flex items-center justify-between py-3 border-b border-white/8">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-text-muted" />
            <div>
              <p className="text-sm text-text-primary">Password</p>
              <p className="text-xs text-text-muted mt-0.5">••••••••</p>
            </div>
          </div>
          <button
            onClick={() => { setPasswordOpen((o) => !o); setEmailOpen(false); }}
            className="text-xs text-purple hover:underline flex items-center gap-1"
          >
            Change {passwordOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {passwordOpen && (
          <form onSubmit={handlePasswordChange} className="pt-3 pb-2 space-y-3">
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-purple/50 transition-colors text-sm"
            />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-purple/50 transition-colors text-sm"
            />
            <div className="flex gap-2">
              <Button type="submit" variant="purple" size="sm" loading={passwordLoading}>
                Update password
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPasswordOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Sign out */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-text-muted" />
            <p className="text-sm text-text-primary">Sign out</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-red-400 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Editable fields */}
      {/* Email preferences. Also the only way back in after using the
          unsubscribe link in an email, so it must toggle both directions. */}
      <div className="glass-card p-6">
        <h2 className="font-heading font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-purple" /> Email Preferences
        </h2>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-medium">Weekly progress email</p>
            <p className="text-text-muted text-xs mt-1 leading-relaxed">
              A short Monday check in with your profile strength, streak and one suggested next step.
              You can turn this back on any time.
            </p>
            <p className="text-text-muted/60 text-[11px] mt-2">
              Account emails such as sign in, password resets and billing are always sent.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={!emailOptOut}
            aria-label="Weekly progress email"
            disabled={savingEmailPref}
            onClick={toggleWeeklyEmails}
            className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors disabled:opacity-50 ${
              !emailOptOut ? "bg-accent" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                !emailOptOut ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-purple" /> Personal Info
          </h2>
          {!canEdit && (
            <span className="text-xs text-text-muted">Next edit: {nextEditDate}</span>
          )}
        </div>
        <p className="text-text-muted/60 text-xs -mt-2">
          You can update your profile once per week. Saving will refresh your college list, recommendations, and profile strength.
        </p>

        <Field label="Name" value={localProfile.name || ""} onChange={(v) => updateField("name", v)} disabled={!canEdit} />
        <SelectField label="Grade" options={GRADES} value={localProfile.grade || ""} onChange={(v) => updateField("grade", v)} disabled={!canEdit} />
        <CountrySelectField label="Country" value={localProfile.country || ""} onChange={(v) => updateField("country", v)} disabled={!canEdit} />
        <CountrySelectField label="Target Country" value={localProfile.target_country || ""} onChange={(v) => updateField("target_country", v)} disabled={!canEdit} />
        <Field label="Dream College" value={localProfile.dream_college || ""} onChange={(v) => updateField("dream_college", v)} disabled={!canEdit} />
        <SelectField label="Aiming Level" options={AIMING} value={localProfile.aiming_level || ""} onChange={(v) => updateField("aiming_level", v)} disabled={!canEdit} />
        <SelectField label="Major Interest" options={MAJORS} value={localProfile.major_interest || ""} onChange={(v) => updateField("major_interest", v)} disabled={!canEdit} />
        <SelectField label="GPA Range" options={GPA_RANGES} value={localProfile.gpa_range || ""} onChange={(v) => updateField("gpa_range", v)} disabled={!canEdit} />
        <Field label="Test Scores" value={localProfile.test_scores || ""} onChange={(v) => updateField("test_scores", v)} disabled={!canEdit} />
        <SelectField label="Time Available" options={TIME_OPTIONS} value={localProfile.time_available || ""} onChange={(v) => updateField("time_available", v)} disabled={!canEdit} />

        <div>
          <label className="block text-sm text-text-muted mb-3">Extracurricular Interests</label>
          <div className="flex flex-wrap gap-2">
            {EC_INTERESTS.map((interest) => {
              const selected = localProfile.extracurricular_interests?.includes(interest);
              return (
                <button
                  key={interest}
                  disabled={!canEdit}
                  onClick={() => {
                    const newInterests = selected
                      ? (localProfile.extracurricular_interests || []).filter((i) => i !== interest)
                      : [...(localProfile.extracurricular_interests || []), interest];
                    updateField("extracurricular_interests", newInterests);
                  }}
                  className={`px-3 py-1.5 rounded-badge text-xs font-medium transition-all border ${
                    selected ? "bg-purple/15 text-purple border-purple/30" : "bg-white/5 text-text-muted border-white/10"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {isDirty && canEdit && (
          <Button variant="primary" onClick={handleSave} loading={saving} className="w-full">
            <Save className="w-4 h-4" /> Save &amp; Update
          </Button>
        )}
      </div>

      {/* Pro Detailed Profile */}
      {localProfile.is_pro ? (
        <DetailedProfileForm
          profile={profile!}
          session={session}
          refreshProfile={refreshProfile}
        />
      ) : (
        <div className="glass-card p-6 border-purple/20 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-purple to-energy" />
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-5 h-5 text-purple" />
            <h2 className="font-heading font-semibold text-text-primary">Detailed Profile</h2>
            <Badge variant="pop">Pro</Badge>
          </div>
          <p className="text-text-muted text-sm mb-4">
            Unlock the detailed profile form to give the AI counselor deeper knowledge about your activities,
            achievements, leadership experience, and personal story, resulting in much more specific and useful advice.
          </p>
          <Link href="/pricing">
            <Button variant="purple" size="sm">
              <Crown className="w-4 h-4" /> Upgrade to Unlock
            </Button>
          </Link>
        </div>
      )}

      {/* Actions */}
      {!localProfile.is_pro && (
        <div className="glass-card p-6">
          <Link href="/pricing">
            <Button variant="pop" className="w-full">
              <Crown className="w-4 h-4" /> Upgrade to Pro
            </Button>
          </Link>
        </div>
      )}

      {/* Danger zone */}
      <div className="glass-card p-6 border-red-500/20">
        <h3 className="font-heading font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-text-muted text-sm mb-4">Permanently delete your account and all associated data.</p>
        <Button variant="ghost" className="!text-red-400 hover:!bg-red-500/10" onClick={handleDelete} loading={deleting}>
          <Trash2 className="w-4 h-4" /> Delete Account
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary focus:outline-none focus:border-purple/50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function CountrySelectField({ label, value, onChange, disabled }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => { if (e.target.value !== "──────────") onChange(e.target.value); }}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary focus:outline-none focus:border-purple/50 transition-colors text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" className="bg-surface">Select a country…</option>
        {COUNTRY_OPTIONS.map((c) => (
          <option key={c} value={c} disabled={c === "──────────"} className="bg-surface">
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectField({ label, options, value, onChange, disabled }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary focus:outline-none focus:border-purple/50 transition-colors text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" className="bg-surface">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-surface">{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, hint, disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      {hint && <p className="text-text-muted/60 text-xs mb-2">{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-purple/50 transition-colors text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

import { Profile } from "@/types";
import { FileText } from "lucide-react";

const DETAILED_FIELDS: { key: string; label: string; placeholder: string; hint: string }[] = [
  // Activities, achievements, leadership, work experience, and community service
  // now live in the Progress tab as structured data (with role, hours, duration,
  // prestige level), removed from here to avoid duplication.
  { key: "strengths", label: "Personal Strengths", placeholder: "e.g., Strong analytical thinking, good at public speaking...", hint: "What are you genuinely good at? Be honest." },
  { key: "weaknesses", label: "Areas for Improvement", placeholder: "e.g., Need to improve time management, limited research experience...", hint: "The AI will help you address these specifically." },
  { key: "personal_story", label: "Personal Story / Essay Topics", placeholder: "e.g., Overcame language barrier as an immigrant, started a business at 14...", hint: "What makes you unique? Any challenges you've overcome?" },
  { key: "family_background", label: "Family Background", placeholder: "e.g., First-generation college student, parents are engineers...", hint: "Relevant family context that may affect your application." },
  { key: "financial_situation", label: "Financial Aid Needs", placeholder: "e.g., Need full scholarship, can afford some tuition...", hint: "This helps recommend schools with good financial aid." },
  { key: "special_circumstances", label: "Special Circumstances", placeholder: "e.g., International student, learning disability, athlete...", hint: "Anything else the AI should know about your situation." },
];

function DetailedProfileForm({ profile, session, refreshProfile }: {
  profile: Profile;
  session: { access_token: string } | null;
  refreshProfile: () => Promise<void>;
}) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const saved = (profile.detailed_profile || {}) as Record<string, string>;
  const [local, setLocal] = useState<Record<string, string>>(saved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocal((profile.detailed_profile || {}) as Record<string, string>);
  }, [profile.detailed_profile]);

  const filledCount = DETAILED_FIELDS.filter(f => local[f.key]?.trim()).length;

  // First-time fill: if the saved version of a field is empty, allow editing even on cooldown
  const savedIsEmpty = DETAILED_FIELDS.every(f => !saved[f.key]?.trim());
  const lastEditedAt = profile.profile_last_edited_at ?? null;
  const canEdit = useMemo(() => {
    if (savedIsEmpty) return true;
    if (!lastEditedAt) return true;
    const msSince = Date.now() - new Date(lastEditedAt).getTime();
    return msSince >= 7 * 24 * 60 * 60 * 1000;
  }, [lastEditedAt, savedIsEmpty]);

  const nextEditDate = useMemo(() => {
    if (!lastEditedAt || savedIsEmpty) return null;
    const next = new Date(new Date(lastEditedAt).getTime() + 7 * 24 * 60 * 60 * 1000);
    return next.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [lastEditedAt, savedIsEmpty]);

  const isDirty = useMemo(() => {
    return DETAILED_FIELDS.some(f => (local[f.key] || "") !== (saved[f.key] || ""));
  }, [local, saved]);

  const handleSave = async () => {
    if (!isDirty) return;
    if (!canEdit) {
      toast.error(`You can update your detailed profile once per week. Next edit available ${nextEditDate}.`);
      return;
    }
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        detailed_profile: local,
        profile_last_edited_at: new Date().toISOString(),
        college_list_cache: null,
        profile_strength_updated_at: null,
        extracurricular_recommendations: null,
        ai_scholarships_cache: null,
        ai_competitions_cache: null,
        daily_tip_cache: null,
      };
      const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id);
      if (error) throw error;
      await refreshProfile();
      if (session?.access_token) {
        toast.success("Detailed profile saved! Recalculating profile strength...");
        try {
          await fetch("/api/profile-strength", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          await refreshProfile();
          toast.success("Profile strength updated!", { duration: 2000 });
        } catch {
          toast.success("Detailed profile saved!");
        }
      } else {
        toast.success("Detailed profile saved!");
      }
    } catch {
      toast.error("Failed to save detailed profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6 border-purple/20 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-purple to-energy" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple" />
          <h2 className="font-heading font-semibold text-text-primary">Detailed Profile</h2>
          <Badge variant="pop">Pro</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">{filledCount}/{DETAILED_FIELDS.length} completed</span>
          {!canEdit && nextEditDate && (
            <span className="text-xs text-text-muted">Next edit: {nextEditDate}</span>
          )}
        </div>
      </div>
      <p className="text-text-muted text-sm">
        The more you fill in, the more personalized and specific the AI counselor&apos;s advice will be.
        {savedIsEmpty && " First-time setup, no cooldown."}
      </p>
      {DETAILED_FIELDS.map((field) => (
        <TextAreaField
          key={field.key}
          label={field.label}
          value={local[field.key] || ""}
          onChange={(v) => setLocal((prev) => ({ ...prev, [field.key]: v }))}
          placeholder={field.placeholder}
          hint={field.hint}
          disabled={!canEdit}
        />
      ))}
      {isDirty && canEdit && (
        <Button variant="primary" onClick={handleSave} loading={saving} className="w-full">
          <Save className="w-4 h-4" /> Save Detailed Profile
        </Button>
      )}
    </div>
  );
}
