import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Common disallow list for all bots — sensitive areas never crawled.
  const disallowAll = ["/dashboard", "/admin", "/api", "/_next"];

  return {
    rules: [
      // ─── AI search crawlers — explicitly allowed for AI discoverability ──
      // OpenAI / ChatGPT Search
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: disallowAll,
      },
      // OpenAI general crawler (GPTBot)
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: disallowAll,
      },
      // OpenAI ads crawler
      {
        userAgent: "OAI-AdsBot",
        allow: "/",
        disallow: disallowAll,
      },
      // Anthropic / Claude
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: disallowAll,
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: disallowAll,
      },
      // Google / Gemini
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: disallowAll,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: disallowAll,
      },
      // Microsoft / Copilot / Bing
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: disallowAll,
      },
      {
        userAgent: "BingPreview",
        allow: "/",
        disallow: disallowAll,
      },
      // ByteDance / Doubao
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: disallowAll,
      },
      // Meta AI
      {
        userAgent: "Meta-ExternalAgent",
        allow: "/",
        disallow: disallowAll,
      },
      {
        userAgent: "Meta-ExternalFetcher",
        allow: "/",
        disallow: disallowAll,
      },
      // Perplexity
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: disallowAll,
      },
      {
        userAgent: "Perplexity-User",
        allow: "/",
        disallow: disallowAll,
      },
      // xAI / Grok
      {
        userAgent: "FriendlyCrawler",
        allow: "/",
        disallow: disallowAll,
      },
      // Common Crawl (used by many AI systems)
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: disallowAll,
      },
      // Amazon (used by some AI systems)
      {
        userAgent: "Amazonbot",
        allow: "/",
        disallow: disallowAll,
      },
      // Apple Intelligence
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: disallowAll,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: disallowAll,
      },
      // Cohere
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: disallowAll,
      },
      // ─── Default rule for all other bots ──────────────────────────
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowAll,
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
