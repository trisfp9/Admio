import { createClient, SupabaseClient, processLock } from "@supabase/supabase-js";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";
import { REMEMBER_COOKIE, REMEMBER_PREF_MAX_AGE, applyAuthCookiePolicy } from "./auth-cookies";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function isValidUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

// Singleton browser client — one instance shared across the whole app.
// Uses @supabase/ssr so the session is stored in cookies (readable by the
// server + middleware), instead of localStorage. This keeps auth state
// consistent across tabs and lets middleware refresh/guard sessions server-side.
let browserClient: SupabaseClient | null = null;

export function createBrowserClient() {
  if (browserClient) return browserClient;
  const url = isValidUrl(SUPABASE_URL) ? SUPABASE_URL : "https://placeholder.supabase.co";
  const key = SUPABASE_ANON_KEY || "placeholder";
  // Custom cookie adapter: we write auth cookies ourselves so we can enforce the
  // "remember me" lifetime (@supabase/ssr otherwise always writes a long-lived
  // cookie). The remember choice lives in the REMEMBER_COOKIE so the server agrees.
  browserClient = createSSRBrowserClient(url, key, {
    // Use an in-process lock instead of the Web Locks API. navigator.locks
    // coordinates across tabs and can deadlock / be "stolen", which was blocking
    // login in a second tab. processLock serializes auth calls within each tab.
    auth: { lock: processLock },
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        return Object.entries(parse(document.cookie)).map(([name, value]) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        if (typeof document === "undefined") return;
        const remember = parse(document.cookie)[REMEMBER_COOKIE];
        for (const { name, value, options } of cookiesToSet) {
          document.cookie = serialize(name, value, applyAuthCookiePolicy(options, remember));
        }
      },
    },
  });
  return browserClient;
}

// Persist the "remember me" choice in a cookie (readable by the server) right
// before signing in, so the auth cookie written next uses the correct lifetime.
export function setRememberPreference(remember: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(REMEMBER_COOKIE, remember ? "true" : "false", {
    path: "/",
    sameSite: "lax",
    maxAge: REMEMBER_PREF_MAX_AGE,
  });
}

// Server-side Supabase client with user's JWT (RLS enforced per user)
export function createServerClient(accessToken: string) {
  const url = isValidUrl(SUPABASE_URL) ? SUPABASE_URL : "https://placeholder.supabase.co";
  const key = SUPABASE_ANON_KEY || "placeholder";
  return createClient(url, key,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

// Admin client — server-side only, bypasses RLS. NEVER expose to client.
export function createAdminClient() {
  const url = isValidUrl(SUPABASE_URL) ? SUPABASE_URL : "https://placeholder.supabase.co";
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder");
}

// Extract and verify JWT from request Authorization header
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}

// Get authenticated user from request — returns null if invalid
export async function getAuthenticatedUser(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const supabase = createServerClient(token);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;
  return { user, supabase };
}
