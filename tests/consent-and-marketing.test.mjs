import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function consentStore(raw, storageBlocked = false) {
  const source = readFileSync(
    new URL("../src/lib/consent.ts", import.meta.url),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const context = vm.createContext({
    exports: {},
    window: {},
    localStorage: {
      getItem: () => raw,
      setItem: () => {
        if (storageBlocked) throw new Error("Storage blocked");
      },
    },
  });
  vm.runInContext(outputText, context);
  return context.exports;
}

test("legacy consent requires a fresh explicit choice", () => {
  assert.equal(consentStore("accepted").getConsentSnapshot(), null);
  assert.equal(consentStore("declined").getConsentSnapshot(), null);
  assert.equal(consentStore("invalid").getConsentSnapshot(), null);
  assert.equal(consentStore('{"version":1}').getConsentSnapshot(), null);
});

test("consent subscribers update immediately even when storage is blocked", () => {
  const store = consentStore(null, true);
  const choice = {
    version: 3,
    analytics: true,
    marketing: false,
    functional: true,
    timestamp: new Date().toISOString(),
  };
  let notifications = 0;
  const unsubscribe = store.subscribeConsent(() => notifications++);
  store.saveConsent(choice);
  store.setConsentValue(choice);
  assert.equal(notifications, 1);
  assert.equal(store.getConsentSnapshot(), choice);
  assert.equal(store.getConsentSSR(), null);
  unsubscribe();
  store.setConsentValue(null);
  assert.equal(notifications, 1);
});

test("every inline consent-gated marketing script has valid JavaScript syntax", () => {
  const source = readFileSync(
    new URL("../src/components/marketing-tags.tsx", import.meta.url),
    "utf8",
  );
  const file = ts.createSourceFile(
    "marketing-tags.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let checked = 0;
  function visit(node) {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText(file) === "ConsentGatedScript"
    ) {
      for (const child of node.children) {
        if (!ts.isJsxExpression(child) || !child.expression) continue;
        const code = vm.runInNewContext(child.expression.getText(file), {
          m: new Proxy({}, { get: () => "123456" }),
        });
        assert.doesNotThrow(() => new vm.Script(code));
        checked++;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  assert.ok(checked >= 10);
});

test("expired or malformed consent never enables optional tracking", () => {
  const base = { version: 3, analytics: true, marketing: true, functional: true, timestamp: new Date().toISOString() };
  assert.equal(consentStore(JSON.stringify(base)).getConsentSnapshot().analytics, true);
  for (const change of [{analytics:"yes"}, {timestamp:"invalid"}, {timestamp:"2020-01-01T00:00:00Z"}, {version:2}]) {
    assert.equal(consentStore(JSON.stringify({...base,...change})).getConsentSnapshot(), null);
  }
});
