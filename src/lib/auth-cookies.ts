// Shared auth-cookie lifetime policy, used by BOTH the browser client and the
// middleware so the session cookie's persistence is consistent everywhere.
//
// The user's "remember me" choice is stored in a readable cookie (so the server
// can see it too). When on, auth cookies persist 30 days; when off, they become
// session cookies that clear when the browser closes.

export const REMEMBER_COOKIE = "admio_remember";
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const REMEMBER_PREF_MAX_AGE = 60 * 60 * 24 * 400; // keep the preference itself ~max

type CookieOpts = {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
};

/**
 * Apply the remember-me policy to an auth cookie's options.
 * - Deletions (maxAge 0 / past expiry) are preserved as-is.
 * - remember "true"  -> 30-day persistent cookie.
 * - otherwise        -> session cookie (no maxAge/expires; clears on browser close).
 */
export function applyAuthCookiePolicy(
  options: CookieOpts | undefined,
  rememberRaw: string | undefined
): CookieOpts {
  const opts: CookieOpts = { ...(options || {}) };

  const isDelete =
    opts.maxAge === 0 || (opts.expires != null && opts.expires.getTime() <= Date.now());
  if (isDelete) return opts;

  if (rememberRaw === "true") {
    opts.maxAge = REMEMBER_MAX_AGE;
    delete opts.expires;
  } else {
    delete opts.maxAge;
    delete opts.expires;
  }
  return opts;
}
