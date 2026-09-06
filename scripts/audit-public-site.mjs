import { writeFileSync, mkdirSync } from "node:fs";
const base = process.env.AUDIT_URL || "http://127.0.0.1:3100";
const response = await fetch(`${base}/sitemap.xml`);
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
  const res = await fetch(new URL(path, base));
  const html = await res.text();
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "";
  const description =
    html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const canonical =
    html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? "";
  const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;
  const issues = [
    res.status !== 200 && `HTTP ${res.status}`,
    !title && "Missing title",
    !description && "Missing description",
    !canonical && "Missing canonical",
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
for (const result of results) {
  if (titles.has(result.title))
    result.issues.push(`Duplicate title with ${titles.get(result.title)}`);
  titles.set(result.title, result.path);
}
mkdirSync("docs/audits", { recursive: true });
writeFileSync(
  "docs/audits/public-content.json",
  JSON.stringify(
    { testedAt: new Date().toISOString(), base, results },
    null,
    2,
  ) + "\n",
);
for (const result of results)
  console.log(
    result.path,
    result.issues.length ? result.issues.join("; ") : "PASS",
  );
if (results.some((r) => r.issues.length)) process.exitCode = 1;
