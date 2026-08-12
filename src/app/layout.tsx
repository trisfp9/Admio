import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Caveat, Instrument_Serif } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { getServerSupabase } from "@/lib/supabase-server";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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

// Editorial italic serif used for the emphasis word in the hero. Contrast
// against the geometric sans reads deliberate rather than decorative.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase makes every relative URL below (canonical, OG image) resolve
  // to the production origin instead of the current deployment URL.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Admio: Your AI College Admissions Counselor",
    // Sub-pages set only their own title; Next appends the brand.
    template: "%s | Admio",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI college counselor",
    "college admissions",
    "extracurricular planner",
    "college list builder",
    "college essay review",
    "scholarship finder",
    "high school students",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Admio: Your AI College Admissions Counselor",
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Admio, AI college admissions counselor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Admio: Your AI College Admissions Counselor",
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
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
    // getSession() reads the (middleware-refreshed) cookie locally, no network
    // round-trip. The middleware already validated the session for route
    // protection; here we only need it to seed the UI, so this is safe and fast.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (user) {
      initialUser = user;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      initialProfile = data ?? null;
    }
  } catch {
    // Supabase not reachable/configured, so fall back to client-side resolution.
  }

  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${caveat.variable} ${instrumentSerif.variable}`}>
      <body className="font-body antialiased">
        {/* Structured data: tells Google which logo and site name belong to the
            brand, which is what powers the icon/name shown next to results. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/icon.png`,
                description: SITE_DESCRIPTION,
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                name: SITE_NAME,
                url: SITE_URL,
                publisher: { "@id": `${SITE_URL}/#organization` },
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: SITE_NAME,
                applicationCategory: "EducationalApplication",
                operatingSystem: "Web",
                url: SITE_URL,
                description: SITE_DESCRIPTION,
                offers: {
                  "@type": "Offer",
                  price: "12",
                  priceCurrency: "USD",
                },
              },
            ]),
          }}
        />
        <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
          {children}
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
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
