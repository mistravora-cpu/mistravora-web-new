import { writeFileSync, mkdirSync } from "node:fs";
const base = process.env.AUDIT_URL || "http://127.0.0.1:3100";
// Bing checks metadata in <head>. A browser-UA scan can accidentally accept
// streamed tags in <body> and miss exactly the issue in Webmaster Tools.
const userAgent = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
const request = (url) => fetch(url, { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(30_000) });
const response = await request(`${base}/sitemap.xml`);
if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);
const sitemap = await response.text();
const paths = [
  ...new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    ),
  ),
];
const results = [];
for (const path of paths) {
  const res = await request(new URL(path, base));
  const html = await res.text();
  const head = html.match(/<head(?:\s[^>]*)?>(.*?)<\/head>/is)?.[1] ?? "";
  const title = head.match(/<title>(.*?)<\/title>/s)?.[1] ?? "";
  const description =
    head.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const canonical =
    head.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  const issues = [
    res.status !== 200 && `HTTP ${res.status}`,
    !title.trim() && "Missing title in head",
    !description.trim() && "Missing description in head",
    !canonical && "Missing canonical in head",
    canonical && new URL(canonical).pathname !== path && "Canonical points to another path",
    /<meta name="robots" content="[^"]*noindex/.test(head) && "Noindex page included in sitemap",
    h1Count !== 1 && `${h1Count} H1 elements`,
  ].filter(Boolean);
  results.push({
    path,
    status: res.status,
    title,
    description,
    canonical,
    h1Count,
    issues,
  });
}
const titles = new Map();
const descriptions = new Map();
for (const result of results) {
  if (result.title && titles.has(result.title))
    result.issues.push(`Duplicate title with ${titles.get(result.title)}`);
  titles.set(result.title, result.path);
  if (result.description && descriptions.has(result.description))
    result.issues.push(`Duplicate description with ${descriptions.get(result.description)}`);
  descriptions.set(result.description, result.path);
  // Editorial prompt, not a claim that search engines require a fixed length.
  result.notes = result.description && result.description.length < 100
    ? [`Short description (${result.description.length} characters): review whether it explains the page clearly.`] : [];
}
mkdirSync("docs/audits", { recursive: true });
writeFileSync(
  "docs/audits/public-content.json",
  JSON.stringify(
    { testedAt: new Date().toISOString(), base, userAgent, results },
    null,
    2,
  ) + "\n",
);
for (const result of results)
  console.log(
    result.path,
    result.issues.length ? result.issues.join("; ") : "PASS",
    result.notes.join("; "),
  );
if (results.some((r) => r.issues.length)) process.exitCode = 1;
