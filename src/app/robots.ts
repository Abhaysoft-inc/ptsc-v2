import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/login",
          "/signup",
          "/forgot-password",
          // Internal routes behind /blogs?…, /events?page=… and /projects?… (see next.config.ts).
          "/blogs/list/",
          "/blogs/search",
          "/events/list/",
          "/projects/list/",
          "/projects/search",
        ],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
