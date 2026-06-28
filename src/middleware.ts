import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { REMEMBER_COOKIE, applyAuthCookiePolicy } from "@/lib/auth-cookies";

// Routes that require a logged-in user. Logged-out visitors are redirected to /auth.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/extracurriculars",
  "/progress",
  "/essay",
  "/counselor",
  "/opportunities",
  "/saved",
  "/profile",
  "/billing",
  "/onboarding",
];

export async function middleware(request: NextRequest) {
  // Start with a pass-through response we can attach refreshed cookies to.
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  // If Supabase isn't configured (e.g. local placeholder), don't block anything.
  if (!url.startsWith("http") || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        const remember = request.cookies.get(REMEMBER_COOKIE)?.value;
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          // Enforce the remember-me lifetime so refreshed cookies don't get
          // silently upgraded to long-lived ones.
          response.cookies.set(name, value, applyAuthCookiePolicy(options, remember))
        );
      },
    },
  });

  // IMPORTANT: getUser() refreshes the session and writes updated auth cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Logged-in users hitting the landing page or auth page go straight to the app.
  if (user && (path === "/" || path === "/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Run on all routes except API (own Bearer auth), static assets, and images.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)"],
};
