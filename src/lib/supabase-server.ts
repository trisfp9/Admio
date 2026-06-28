import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

// Server-side Supabase client that reads the auth session from cookies.
// Used in Server Components (e.g. the root layout) to render the correct
// logged-in state on the first paint. Cookie writes are no-ops here —
// the middleware is responsible for refreshing auth cookies.
export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* no-op: cannot set cookies from a Server Component; middleware handles refresh */
      },
    },
  });
}
