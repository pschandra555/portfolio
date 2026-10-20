import type { MetadataRoute } from "next";
import { links, meta, projects } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: links.site, lastModified: meta.updated, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: `${links.site}/operations/${p.slug}`,
      lastModified: meta.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
