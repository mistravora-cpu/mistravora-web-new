import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const exports = {};
new Function(
  "exports",
  ts.transpileModule(readFileSync("src/lib/quote-links.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
)(exports);
const { quoteLink, resolveQuoteLink } = exports;

test("quote destinations retain service context and migrate old calculator links", () => {
  assert.equal(quoteLink(), "/pricing#estimate");
  assert.equal(
    quoteLink("Website & app"),
    "/pricing?service=Website%20%26%20app#estimate",
  );
  for (const label of [
    "Get a free quote",
    "Request a quotation",
    "Start your project",
    "Get pricing",
    "Get started",
  ]) {
    assert.equal(resolveQuoteLink("/contact", label), "/pricing#estimate");
  }
  assert.equal(
    resolveQuoteLink(
      "https://mistravora.com/tools/cost-calculator?service=POS",
      "Plan",
    ),
    "/pricing?service=POS#estimate",
  );
});

test("contact, booking and external destinations are preserved", () => {
  for (const [href, label] of [
    ["/contact", "Get in touch"],
    ["/book", "Request a quotation"],
    ["https://example.com/contact", "Get a quote"],
    ["mailto:info@mistravora.com", "Get pricing"],
  ]) {
    assert.equal(resolveQuoteLink(href, label), href);
  }
});
