import type { MetadataRoute } from "next";

const BASE_URL = "https://apikeychain.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/callback"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
