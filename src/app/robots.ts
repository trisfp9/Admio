import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Signed-in app routes hold per-user data and have no SEO value, so keep
// crawlers on the marketing pages. Everything here is already auth-gated by
// middleware — this just avoids wasting crawl budget on redirects.
const APP_ONLY_ROUTES = [
  "/api/",
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
  "/auth",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: APP_ONLY_ROUTES,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
