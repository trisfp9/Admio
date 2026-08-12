"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createBrowserClient } from "@/lib/supabase";
import { updateStreak } from "@/lib/streak";
import {
  LayoutDashboard, BookOpen, MessageSquare, Compass, User, LogOut,
  Crown, ChevronLeft, Menu, Bookmark, TrendingUp, PenLine, Lock, X, RefreshCw,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

const APP_VERSION = "1.0.0";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, pro: false },
  { href: "/extracurriculars", label: "Activities", icon: BookOpen, pro: false },
  { href: "/progress", label: "Progress", icon: TrendingUp, pro: false },
  { href: "/essay", label: "Essay", icon: PenLine, pro: true },
  { href: "/counselor", label: "Counselor", icon: MessageSquare, pro: false },
  { href: "/opportunities", label: "Discover", icon: Compass, pro: false },
  { href: "/saved", label: "Saved", icon: Bookmark, pro: false },
  { href: "/profile", label: "Profile", icon: User, pro: false },
];

function AppLayoutInner({ children }: { children: ReactNode }) {
  const { user, profile, loading, profileError, refreshProfile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Streak check on mount
  useEffect(() => {
    if (user) {
      const supabase = createBrowserClient();
      updateStreak(supabase, user.id).catch(() => {});
    }
  }, [user]);

  // Version check
  useEffect(() => {
    const cached = localStorage.getItem("admio_version");
    if (cached && cached !== APP_VERSION) {
      setShowUpdateBanner(true);
    }
    localStorage.setItem("admio_version", APP_VERSION);
  }, []);

  // Redirect if not authed
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // The profile couldn't be loaded (offline, blocked request, or a failed
  // self-heal). Every page below gates on `profile`, so without this the app
  // would sit on a skeleton indefinitely with no way out.
  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <h1 className="font-heading font-bold text-xl text-text-primary mb-2">
            Couldn&apos;t load your profile
          </h1>
          <p className="text-text-muted text-sm mb-6">
            This is usually a weak connection. Check your network and try again, and signing
            out and back in also fixes it.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={async () => {
                setRetrying(true);
                await refreshProfile();
                setRetrying(false);
              }}
              disabled={retrying}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Retrying..." : "Try again"}
            </button>
            <button
              onClick={() => void signOut()}
              className="px-4 py-2.5 rounded-button text-text-muted hover:text-text-primary text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-surface/50 p-6 fixed h-full z-40">
        <Link href="/dashboard" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple to-accent flex items-center justify-center">
            <img src="/logo.png" alt="Admio" className="w-[80%] h-[80%] object-contain" />
          </div>
          <span className="font-heading font-bold text-lg text-text-primary">Admio</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const showLock = item.pro && !profile?.is_pro;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-purple/10 text-purple"
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {showLock && <Lock className="w-3.5 h-3.5 text-pop/70" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 pt-4 border-t border-white/5">
          {profile?.is_pro ? (
            <Link
              href="/billing"
              className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold bg-gradient-to-r from-pop/15 to-purple/15 border border-pop/20 hover:border-pop/40 transition-colors"
            >
              <Crown className="w-5 h-5 text-pop" />
              <span className="text-text-primary">Pro Member</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-pop font-bold">Active</span>
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium text-pop hover:bg-pop/5 transition-colors"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </Link>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          <p className="text-text-muted/40 text-[10px] leading-relaxed pt-2 px-1">
            Admio uses AI to provide guidance. Outputs are informational, not professional advice.
          </p>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-surface border-r border-white/5 z-50 lg:hidden p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-bold text-lg text-text-primary">Admio</span>
                <button onClick={() => setSidebarOpen(false)} className="text-text-muted">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  const showLock = item.pro && !profile?.is_pro;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium transition-all ${
                        active ? "bg-purple/10 text-purple" : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {showLock && <Lock className="w-3.5 h-3.5 text-pop/70" />}
                    </Link>
                  );
                })}
              </nav>
              <p className="text-text-muted/40 text-[10px] leading-relaxed mt-6 px-1">
                Admio uses AI to provide guidance. Outputs are informational, not professional advice.
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Version update banner */}
        {showUpdateBanner && (
          <div className="bg-purple/10 border-b border-purple/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4 text-purple" />
              <span className="text-text-primary">A new version of Admio is available.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { localStorage.setItem("admio_version", APP_VERSION); window.location.reload(); }}
                className="text-xs font-medium text-purple hover:text-purple/80 transition-colors"
              >
                Refresh now
              </button>
              <button onClick={() => setShowUpdateBanner(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="text-text-muted">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading font-bold text-text-primary">Admio</span>
          <Link href="/profile">
            <User className="w-5 h-5 text-text-muted" />
          </Link>
        </div>

        <div className="p-6 lg:p-10 max-w-6xl">
          {children}
        </div>
      </main>

    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
