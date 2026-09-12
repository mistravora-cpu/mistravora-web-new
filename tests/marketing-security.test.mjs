import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(file, overrides = {}) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const context = vm.createContext({
    exports: {},
    require: (name) => overrides[name] ?? (name === "./project-links" ? {attachProjectLinks:async rows=>rows} : name.startsWith("./") ? load(`src/lib/${name.slice(2)}.ts`) : require(name)),
    process: {
      env: {
        EMAIL_TOKEN_SECRET: "test-only-secret-that-is-more-than-32-characters",
      },
    },
    Buffer,
    URL,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(outputText, context);
  return context.exports;
}
test("unsubscribe signatures reject tampering and unrelated subscriber IDs", () => {
  const api = load("src/lib/email-tokens.ts");
  const id = "d4da6f74-9c16-414b-b42a-2f1a7800590a";
  const token = api.unsubscribeToken(id);
  assert.equal(api.verifyUnsubscribeToken(token), id);
  assert.equal(
    api.verifyUnsubscribeToken(
      token.replace(id, "00000000-0000-0000-0000-000000000000"),
    ),
    null,
  );
  assert.equal(api.verifyUnsubscribeToken(token + ".extra"), null);
  assert.equal(api.verifyUnsubscribeToken("invalid"), null);
});
test("JSON-LD cannot terminate its script element", () => {
  const api = load("src/lib/seo.ts", {
    "@/lib/site": {
      site: {
        url: "https://mistravora.com",
        name: "Mistravora",
        description: "Software",
      },
    },
  });
  const dangerous = { title: "</script><script>alert(1)</script>" };
  const result = api.jsonLd(dangerous);
  assert.ok(!result.includes("<"));
  assert.deepEqual(JSON.parse(result), dangerous);
});
test("social metadata retains generated card when an article has no cover image", () => {
  const api = load("src/lib/seo.ts", {
    "@/lib/site": {
      site: {
        url: "https://mistravora.com",
        name: "Mistravora",
        description: "Software",
      },
    },
  });
  const result = api.withSocialMetadata({
    title: "Example",
    alternates: { canonical: "https://mistravora.com/blog/example" },
    openGraph: { type: "article", images: undefined },
    twitter: { images: undefined },
  });
  assert.equal(result.openGraph.type, "article");
  assert.equal(
    result.openGraph.images[0].url,
    "https://mistravora.com/share/blog/example",
  );
  assert.equal(
    result.twitter.images[0],
    "https://mistravora.com/share/blog/example",
  );
});

test("canonical URLs match the deployed host while preserving external syndication", () => {
  const api = load("src/lib/seo.ts", { "@/lib/site": { site: { url: "https://www.mistravora.com", name: "Mistravora" } } });
  assert.equal(api.canonicalUrl("https://mistravora.com/blog/post#body"), "https://www.mistravora.com/blog/post");
  assert.equal(api.canonicalUrl("/about"), "https://www.mistravora.com/about");
  assert.equal(api.canonicalUrl("https://publication.example/original"), "https://publication.example/original");
  assert.equal(api.canonicalUrl("https://mistravora.com/about/"), "https://www.mistravora.com/about");
  for (const url of ["javascript:alert(1)", "http://publication.example", "https://user:password@example.com", "not a URL"]) assert.equal(api.canonicalUrl(url), null);
});

test("partial SEO settings preserve content defaults and noindex applies to Google too", () => {
  const api = load("src/lib/seo.ts", { "@/lib/site": { site: { url: "https://www.mistravora.com", name: "Mistravora" } } });
  const base = api.withSocialMetadata({ title: "Real article", description: "Its actual summary", alternates: { canonical: "https://www.mistravora.com/blog/post" }, openGraph: { type: "article", images: ["https://images.example/cover.webp"] } });
  const result = api.mergeSeoOverrides(base, { title: "  ", description: null, canonical: "https://mistravora.com/blog/post", og_image: "javascript:alert(1)", noindex: true });
  assert.equal(result.title, base.title);
  assert.equal(result.description, base.description);
  assert.equal(result.alternates.canonical, base.alternates.canonical);
  assert.equal(result.openGraph.images[0], "https://images.example/cover.webp");
  assert.equal(result.openGraph.type, "article");
  assert.equal(result.robots.index, false);
  assert.equal(result.robots.googleBot.index, false);
  const edited = api.mergeSeoOverrides(base, { title: "<b>Approved title</b>", description: "<p>Approved summary</p>" });
  assert.equal(edited.title, "Approved title");
  assert.equal(edited.description, "Approved summary");
  assert.equal(api.mergeSeoOverrides(base, { canonical: "not a URL" }).alternates.canonical, base.alternates.canonical);
});

test("image sitemap entries are absolute, deduplicated and reject unsafe sources", () => {
  const api = load("src/lib/seo.ts", { "@/lib/site": { site: { url: "https://www.mistravora.com", name: "Mistravora" } } });
  assert.deepEqual(Array.from(api.sitemapImages("/assets/photo.webp", "https://images.example/a.webp", "/assets/photo.webp", "data:image/png;base64,AA", "//untrusted.example/a")), ["https://www.mistravora.com/assets/photo.webp", "https://images.example/a.webp"]);
  assert.equal(api.sitemapImages(null, "javascript:alert(1)"), undefined);
});

test("sitemap keeps migrated canonicals and excludes noindex or syndicated pages", async () => {
  const siteModule = { site: { url: "https://www.mistravora.com", name: "Mistravora" } };
  const seo = load("src/lib/seo.ts", { "@/lib/site": siteModule });
  const api = load("src/app/sitemap.ts", {
    "@/lib/site": siteModule,
    "@/lib/seo": seo,
    "@/lib/seo-overrides": { getIndexablePaths: async () => [
      { path: "/about", canonical: "https://mistravora.com/about/" },
      { path: "/pricing", noindex: true },
      { path: "/research/shared", canonical: "https://publication.example/original" },
    ] },
    "@/lib/content": { collections: { solutions: {} }, getCollection: async () => [{ slug: "crm", image: "/assets/crm.webp" }] },
    "@/lib/services": {
      getPublishedPosts: async () => [{ slug: "guide", cover_image: "https://images.example/guide.webp" }],
      getCaseStudies: async () => [], getIndustries: async () => [], getPolicies: async () => [],
      getResearch: async () => [{ slug: "shared" }],
      getTeamMembers: async () => [{ slug: "person", photo: "https://images.example/person.webp" }],
      memberSlug: member => member.slug,
    },
  });
  const sitemap = await api.default();
  const byPath = new Map(sitemap.map(entry => [new URL(entry.url).pathname, entry]));
  assert(byPath.has("/about"));
  assert(!byPath.has("/pricing"));
  assert(!byPath.has("/research/shared"));
  assert.equal(byPath.get("/blog/guide").images[0], "https://images.example/guide.webp");
  assert.equal(byPath.get("/about/team/person").images[0], "https://images.example/person.webp");
  assert.equal(byPath.get("/solutions/crm").images[0], "https://www.mistravora.com/assets/crm.webp");
});

test("failed content reads reject instead of becoming cached empty results", async () => {
  let outcome = { data: null, error: new Error("Temporary database failure") };
  const query = {
    select() {
      return this;
    },
    order() {
      return this;
    },
    eq() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(outcome).then(resolve, reject);
    },
  };
  const api = load("src/lib/services.ts", {
    "next/cache": { unstable_cache: (fn) => fn },
    "@/lib/supabase/server": {},
    "@/lib/supabase/public": {
      createPublicClient: () => ({ from: () => query }),
    },
  });
  await assert.rejects(api.getCaseStudies(true), /Temporary database failure/);
  outcome = { data: [], error: null };
  assert.equal((await api.getCaseStudies(true)).length, 0);
});
