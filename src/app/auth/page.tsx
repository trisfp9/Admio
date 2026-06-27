"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient, applyRememberPreference } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import GeometricGrid from "@/components/landing/GeometricGrid";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signin" ? "signin" : "signup"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [remember, setRemember] = useState(false);
  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/confirmed` },
        });
        if (error) throw error;

        // Redirect to verification page — profile will be created after email confirm
        router.push("/auth/verify");
      } else {
        // Rebuild the client with the chosen persistence BEFORE signing in, so
        // the auth cookie is written with the right lifetime (30-day vs session).
        const client = applyRememberPreference(remember);
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check if onboarding completed
        const { data: { user } } = await client.auth.getUser();
        let dest = "/onboarding";
        if (user) {
          const { data: profile } = await client
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();
          if (profile?.onboarding_completed) dest = redirectTo || "/dashboard";
        }
        // Full-page navigation so the server re-renders with the new session
        // cookie (seeds auth state) and the app uses the rebuilt client.
        window.location.assign(dest);
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-accent flex items-center justify-center">
              <img src="/logo.png" alt="Admio" className="w-[80%] h-[80%] object-contain" />
            </div>
            <span className="font-heading font-bold text-2xl text-text-primary">Admio</span>
          </Link>

          <h1 className="font-heading font-bold text-4xl text-text-primary mb-4 leading-tight">
            Your roadmap to the
            <br />
            <span className="text-gradient">school of your dreams.</span>
          </h1>
          <p className="text-text-muted text-lg mb-8">
            Join thousands of students building their path to top colleges.
          </p>

          <div className="glass-card p-6 overflow-hidden">
            <GeometricGrid />
          </div>
        </motion.div>

        {/* Right — Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="glass-card p-8 md:p-10">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-accent flex items-center justify-center">
                <img src="/logo.png" alt="Admio" className="w-[80%] h-[80%] object-contain" />
              </div>
              <span className="font-heading font-bold text-xl text-text-primary">Admio</span>
            </div>

            {/* Toggle */}
            <div className="flex bg-white/5 rounded-button p-1 mb-8">
              {(["signup", "signin"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-200 ${
                    mode === m
                      ? "bg-purple text-white"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {m === "signup" ? "Sign Up" : "Sign In"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <h2 className="font-heading font-bold text-2xl text-text-primary">
                  {mode === "signup" ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-text-muted text-sm">
                  {mode === "signup"
                    ? "Start building your path to your dream school."
                    : "Pick up right where you left off."}
                </p>

                <div>
                  <label className="block text-sm text-text-muted mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-purple/50 transition-colors text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-text-muted">Password</label>
                    {mode === "signin" && (
                      <Link href="/auth/reset-password" className="text-xs text-purple hover:underline">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-button text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-purple/50 transition-colors text-sm"
                  />
                </div>

                {mode === "signin" && (
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple focus:ring-purple/50 accent-purple cursor-pointer"
                    />
                    <span className="text-xs text-text-muted">Remember me for 30 days</span>
                  </label>
                )}

                {mode === "signup" && (
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-purple focus:ring-purple/50 accent-purple cursor-pointer"
                    />
                    <span className="text-xs text-text-muted leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" target="_blank" className="text-purple hover:underline">Terms of Service</Link>,{" "}
                      <Link href="/privacy" target="_blank" className="text-purple hover:underline">Privacy Policy</Link>, and{" "}
                      <Link href="/cookies" target="_blank" className="text-purple hover:underline">Cookie Policy</Link>
                    </span>
                  </label>
                )}

                <Button
                  type="submit"
                  variant="purple"
                  loading={loading}
                  disabled={mode === "signup" && !agreed}
                  className="w-full"
                  size="lg"
                >
                  {mode === "signup" ? "Create Account" : "Sign In"}
                </Button>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
