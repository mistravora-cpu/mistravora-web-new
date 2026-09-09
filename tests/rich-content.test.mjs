import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url),
  modules = new Map();
function load(file, overrides = {}) {
  const key = file + Object.keys(overrides).join();
  if (modules.has(key)) return modules.get(key);
  const exports = {};
  modules.set(key, exports);
  new Function(
    "exports",
    "require",
    ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
  )(
    exports,
    (name) =>
      overrides[name] ??
      (name.startsWith("./")
        ? load("src/lib/" + name.slice(2) + ".ts", overrides)
        : require(name)),
  );
  return exports;
}
const { renderArticleHtml } = load("src/lib/article-html.ts");
const { primaryContentImage, contentText, firstContent } = load(
  "src/lib/content-preview.ts",
);
test("primary image is consistent: explicit image, then first safe body image", () => {
  const body =
    '<script>"<img src="https://bad.example/tracker">"</script><img src="javascript:alert(1)"><figure><img src="https://cdn.example/photo.webp" alt="Example"></figure>';
  assert.equal(
    primaryContentImage("https://cdn.example/cover.webp", body),
    "https://cdn.example/cover.webp",
  );
  assert.equal(primaryContentImage("", body), "https://cdn.example/photo.webp");
  assert.equal(
    primaryContentImage(
      null,
      '<img src="//other.example/x">',
      '<img src="/assets/diagram.webp">',
    ),
    "/assets/diagram.webp",
  );
  assert.equal(
    primaryContentImage(null, '<img src="https://user:pass@example.com/x">'),
    null,
  );
  assert.equal(
    primaryContentImage(null, '<img src="/\\evil.example/x">'),
    null,
  );
});
test("catalog and SEO text removes markup, styles and scripts with readable spacing", () => {
  assert.equal(
    contentText(
      "<style>body{color:red}</style><h2>Research &amp; design</h2><p>One <strong>clear</strong> message.</p><script>bad()</script>",
    ),
    "Research & design One clear message.",
  );
  assert.equal(contentText("2 < 3"), "2 < 3");
  assert.equal(contentText("A long sentence", 8), "A long…");
  assert.equal(firstContent("", "fallback"), "fallback");
});
test("CSS is isolated per content block even with root and sibling selectors", () => {
  const input =
    "<style>body{color:red}body + footer{color:blue}:root ~ *{color:green}html body h2{color:purple}@media(max-width:600px){.grid{display:grid}}</style><h2>Heading</h2>";
  const a = renderArticleHtml(input, '[data-article-scope="abc123"]');
  assert.match(
    a.css,
    /\[data-article-scope="abc123"\] \[data-article-root\] \+ footer/,
  );
  assert.match(a.css, /@media/);
  assert.match(a.css, /\[data-article-root\] h2\{color:purple\}/);
  assert.ok(!a.css.includes('scope="def456"'));
  assert.throws(() => renderArticleHtml(input, "body"));
});
test("document headings retain their CSS after normalizing the page heading level", () => {
  const { html, css } = renderArticleHtml(
    "<html><head><style>html > body h1{color:purple}</style></head><body><h1>Title</h1></body></html>",
  );
  assert.equal(html, "<h2>Title</h2>");
  assert.match(
    css,
    /\[data-article-content\] \[data-article-root\] h2\{color:purple\}/,
  );
});
test("internal CSS permits layout and hover styling but blocks remote loads and overlays", () => {
  const { html, css } = renderArticleHtml(
    '<style>.card:hover{transform:translateY(-2px);box-shadow:0 2px 5px #000}p{position:fixed;z-index:999;animation:spin 1s;background:url(https://tracker.example);color:blue}@font-face{font-family:bad;src:url(https://tracker.example/a)}</style><details><summary>Details</summary><p style="color:red;position:fixed">Safe</p></details><form><input></form>',
  );
  assert.ok(css.includes(":hover"));
  assert.ok(css.includes("transform:translateY"));
  assert.ok(!/url|@font-face|position|z-index|animation/.test(css));
  assert.ok(html.includes("<details>"));
  assert.ok(html.includes("color:red"));
  assert.ok(!/<form|<input|position/.test(html));
});
test("responsive CSS preserves media-query comparison operators", () => {
  const { css } = renderArticleHtml(
    "<style>@media (width < 600px){p{font-size:14px}}@media (400px <= width){p{color:blue}}</style><p>Responsive</p>",
  );
  assert.ok(css.includes("(width < 600px)"));
  assert.ok(css.includes("(400px <= width)"));
});
test("CSS cannot load remote images through image-set or escaped property names", () => {
  const { html, css } = renderArticleHtml(
    '<style>p{background:image-set("https://tracker.example/pixel" 1x);po\\73ition:fixed;color:blue}</style><p style="background:image-set(\'https://tracker.example/pixel\' 1x)">Safe</p>',
  );
  assert.ok(!/image-set|tracker|\\/.test(css));
  assert.ok(!/image-set|tracker/.test(html));
  assert.ok(css.includes("color:blue"));
});
test("HTML preview rejects unauthenticated requests before processing content", async () => {
  const preview = load("src/app/dashboard/content-preview-action.ts", {
    "@/lib/auth": { requireAdmin: async () => null },
    "@/lib/article-html": {
      renderArticleHtml: () => {
        throw Error("Should not run");
      },
    },
  });
  assert.deepEqual(await preview.previewContent("<p>Preview</p>"), {
    error: "Unauthorized",
  });
});
