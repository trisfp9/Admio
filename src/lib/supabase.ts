import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

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

// Keep the session cookie for 30 days so users stay logged in across tabs and
// browser restarts ("remember me").
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export function createBrowserClient() {
  if (browserClient) return browserClient;
  const url = isValidUrl(SUPABASE_URL) ? SUPABASE_URL : "https://placeholder.supabase.co";
  const key = SUPABASE_ANON_KEY || "placeholder";
  // "Remember me" (default on): 30-day cookie. If the user opted out, use a
  // session cookie that clears when the browser closes.
  const remember =
    typeof window === "undefined" || localStorage.getItem("admio_remember") !== "false";
  browserClient = createSSRBrowserClient(url, key, {
    cookieOptions: remember ? { maxAge: SESSION_MAX_AGE } : {},
  });
  return browserClient;
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
