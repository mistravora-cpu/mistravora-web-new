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
    },
  });
  const context = vm.createContext({
    exports: {},
    require: (name) => overrides[name] ?? (name === "./project-links" ? {attachProjectLinks:async rows=>rows} : name === "./team-slug" ? load("src/lib/team-slug.ts") : require(name)),
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
