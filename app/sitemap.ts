import type { MetadataRoute } from "next"
import { getAllKeywordSlugs } from "@/lib/seo/keywords"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.signuppro.app"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]

  // SEO landing pages
  const keywordSlugs = getAllKeywordSlugs()
  const seoPages: MetadataRoute.Sitemap = keywordSlugs.map((slug) => ({
    url: `${baseUrl}/s/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticPages, ...seoPages]
}
