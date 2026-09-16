// IndexNow ownership proof is intentionally public at the website root.
export const indexNowConfig = {
  origin: "https://www.mistravora.com",
  key: "243cc496d6764d31a932e95206a2eacc",
  endpoint: "https://api.indexnow.org/indexnow",
} as const;

const publicRoots = new Set([
  "about", "services", "solutions", "industries", "pricing", "projects", "blog",
  "research", "careers", "tools", "demos", "contact", "assistant", "brand",
  "insights", "glossary", "knowledge-base", "authors", "resources", "policies", "book",
]);

export function indexNowUrls(paths: string[]): string[] {
  const urls = new Set<string>();
  for (const value of paths) {
    if (!value || /[\\\u0000-\u001f\u007f]/.test(value)) continue;
    try {
      const url = new URL(value, indexNowConfig.origin);
      if (url.origin !== indexNowConfig.origin || url.username || url.password || url.search) continue;
      // Only public page paths, never private routes, files or token-bearing URLs.
      if (!/^\/(?:[a-z0-9-]+\/?)*$/i.test(url.pathname)) continue;
      if (url.pathname !== "/" && !publicRoots.has(url.pathname.split("/")[1])) continue;
      if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
      if (url.pathname === "/tools/cost-calculator") continue;
      url.hash = "";
      urls.add(url.href);
    } catch { /* Ignore malformed CMS paths without interrupting content saves. */ }
  }
  return [...urls];
}

export function indexNowPayload(paths: string[]) {
  const urlList = indexNowUrls(paths);
  if (!urlList.length || urlList.length > 10000) throw new Error("Submit between 1 and 10,000 public page URLs.");
  return {
    host: new URL(indexNowConfig.origin).host,
    key: indexNowConfig.key,
    keyLocation: `${indexNowConfig.origin}/${indexNowConfig.key}.txt`,
    urlList,
  };
}

export type IndexNowResult = {
  ok: boolean;
  message: string;
  count: number;
  checkedAt: string;
  status?: number;
  urls?: string[];
};
