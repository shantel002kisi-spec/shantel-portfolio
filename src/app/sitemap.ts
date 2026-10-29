import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  const lastModified = new Date();
  return [
    { url: siteUrl.toString(), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: new URL("/banking-demo", siteUrl).toString(), lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
