"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createBrowserClient, clearRememberPreference } from "@/lib/supabase";
import { Profile } from "@/types";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  /** True when the profile could not be loaded after several attempts. */
  profileError: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  profileError: false,
  refreshProfile: async () => {},
  signOut: async () => {},
});

// Defaults for a brand-new profile row. Kept in sync with the other creation
// sites (/auth/confirmed and the auth callback route).
const NEW_PROFILE_DEFAULTS = {
  onboarding_completed: false,
  xp: 0,
  streak: 0,
  ai_messages_used: 0,
  ai_messages_this_month: 0,
  profile_strength: 0,
  is_pro: false,
};

const MAX_PROFILE_RETRIES = 3;

// Helper: wrap any promise with a timeout that resolves to a fallback instead of hanging.
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: Profile | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  // The server already resolved auth state from cookies, so don't start in a
  // loading/skeleton state, render the correct logged-in/out UI immediately.
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);

  const supabase = createBrowserClient();
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const fetchProfile = useCallback(async (userId: string) => {
    // Race against a timeout so a stale connection can never hang the app.
    // If it times out, keep whatever profile we already have (better than null-stuck)
    // and retry a bounded number of times.
    try {
      // maybeSingle() returns { data: null, error: null } for "no row", which lets
      // us tell a genuinely missing profile apart from a network/RLS failure.
      // single() conflates the two by erroring on zero rows.
      const query = supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then((r) => r) as Promise<{ data: Profile | null; error: Error | null }>;
      const result = await withTimeout(
        query,
        6000,
        { data: null, error: new Error("timeout") }
      );

      if (result.data) {
        setProfile(result.data as Profile);
        setProfileError(false);
        retryCountRef.current = 0;
        return;
      }

      // No row and no error: the profile genuinely doesn't exist. This happens
      // when the email-confirmation tab was closed before the row was written.
      // Self-heal by creating it here instead of leaving the app on a skeleton
      // forever (RLS allows a user to insert their own row).
      if (!result.error) {
        const { data: created } = await supabase
          .from("profiles")
          .upsert({ id: userId, ...NEW_PROFILE_DEFAULTS }, { onConflict: "id" })
          .select()
          .maybeSingle();
        if (created) {
          setProfile(created as Profile);
          setProfileError(false);
          retryCountRef.current = 0;
          return;
        }
      }

      // Transient failure: keep any stale profile and retry a few times, then
      // surface an error so the UI can offer a retry rather than spinning.
      setProfile((prev) => prev ?? null);
      if (retryCountRef.current < MAX_PROFILE_RETRIES) {
        retryCountRef.current += 1;
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          void fetchProfile(userId);
        }, 2500);
      } else {
        setProfileError(true);
      }
    } catch {
      setProfile((prev) => prev ?? null);
      setProfileError(true);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    // Allow a fresh round of retries when the user explicitly asks again.
    retryCountRef.current = 0;
    setProfileError(false);
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    // scope: "local" clears the session locally without a slow server-side
    // global revoke round-trip, which makes sign-out instant.
    await supabase.auth.signOut({ scope: "local" });
    // Clear the remember-me preference so persistence resets until the user
    // explicitly checks the box again on the next sign-in.
    clearRememberPreference();
    setUser(null);
    setSession(null);
    setProfile(null);
    window.location.href = "/auth?mode=signin";
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    // HARD SAFETY: no matter what, flip loading off within 4s of mount.
    // Prevents the "stuck on loading forever" bug when getSession() hangs
    // on a stale refresh token.
    const hardTimer = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    const init = async () => {
      const { data } = await withTimeout(
        supabase.auth.getSession(),
        3500,
        { data: { session: null } } as { data: { session: Session | null } }
      );
      const s = data.session;
      if (cancelled) return;
      if (s?.user) {
        setUser(s.user);
        setSession(s);
        await fetchProfile(s.user.id);
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // When the tab becomes visible again after being idle, proactively refresh
    // the session AND re-fetch the profile so stale state doesn't leave the UI
    // stuck on a skeleton.
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { data } = await withTimeout(
          supabase.auth.refreshSession(),
          4000,
          { data: { session: null, user: null } } as { data: { session: Session | null; user: User | null } }
        );
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          await fetchProfile(data.session.user.id);
        }
      } catch {
        // refresh failed, onAuthStateChange will fire SIGNED_OUT if the session is truly dead
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(hardTimer);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [supabase, fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, profileError, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
