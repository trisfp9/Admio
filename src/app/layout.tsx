import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Caveat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/lib/auth-context";
import { getServerSupabase } from "@/lib/supabase-server";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admio — Your AI Admission Counselor",
  description:
    "AI-powered college admissions assistant for high school students. Get personalized guidance on extracurriculars, college selection, and applications.",
  keywords: ["college admissions", "high school", "extracurriculars", "AI counselor"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve auth state from cookies on the server so the first paint is already
  // correct (no logged-out flash, consistent across tabs/reloads).
  let initialUser = null;
  let initialProfile = null;
  try {
    const supabase = getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      initialUser = user;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      initialProfile = data ?? null;
    }
  } catch {
    // Supabase not reachable/configured — fall back to client-side resolution.
  }

  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
          {children}
        </AuthProvider>
        <SpeedInsights />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#141929",
              color: "#F0F0F0",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#8B5CF6", secondary: "#080E1A" },
            },
            error: {
              iconTheme: { primary: "#FF6B6B", secondary: "#0A0F1E" },
            },
          }}
        />
      </body>
    </html>
  );
}
