import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const exports = {};
new Function("exports", "require", ts.transpileModule(readFileSync("src/lib/site-audit.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText)(exports, require);
const { isPublicAddress, quickAudit } = exports;

test("audit fetcher refuses private, loopback and metadata addresses", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"])
    assert.equal(isPublicAddress(ip), false, ip);
  for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])
    assert.equal(isPublicAddress(ip), true, ip);
});

test("quick audit reads quoted and unquoted HTML attributes", async (t) => {
  const html = `<!doctype html><html lang=en><head><meta charset=utf-8><title>Example business website home</title><meta name=viewport content="width=device-width, initial-scale=1"><meta name='description' content='A clear description of this example business website for search engine result pages.'><link rel=canonical href=https://example.com/></head><body><h1>Hi</h1><label for=q>Search</label><input id=q><img src=a.png alt="" width=1 height=1></body></html>`;
  t.mock.method(globalThis, "fetch", async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } }));
  const result = await quickAudit("https://93.184.215.14/");
  const failed = result.checks.filter(c => !c.passed).map(c => c.label);
  for (const label of ["Page title", "Meta description", "One main heading (H1)", "Canonical URL", "Page language", "Image text alternatives", "Form fields labelled", "Mobile viewport", "HTML5 doctype and charset"])
    assert.ok(!failed.includes(label), label);
});

test("audit rejects local hosts before any request is made", async () => {
  await assert.rejects(quickAudit("http://localhost/"), /public/i);
  await assert.rejects(quickAudit("http://127.0.0.1/"), /public/i);
  await assert.rejects(quickAudit("http://169.254.169.254/latest/meta-data"), /public/i);
  await assert.rejects(quickAudit("https://example.com:8443/"), /port/i);
});
