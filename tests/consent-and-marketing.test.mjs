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
  return { ...context.exports, queuedCommands: context.window.dataLayer };
}

test("Google consent commands use the Arguments format required by gtag", () => {
  const store = consentStore(null);
  const initial = store.queuedCommands[0];
  assert.equal(Object.prototype.toString.call(initial), "[object Arguments]");
  assert.equal(initial[0], "consent");
  assert.equal(initial[1], "default");
  assert.equal(initial[2].analytics_storage, "denied");
  store.setConsentValue({ version: 4, analytics: true, marketing: false, functional: true, timestamp: new Date().toISOString() });
  const update = store.queuedCommands.at(-1);
  assert.equal(Object.prototype.toString.call(update), "[object Arguments]");
  assert.equal(update[2].analytics_storage, "granted");
  assert.equal(update[2].ad_storage, "denied");
});

test("legacy consent requires a fresh explicit choice", () => {
  assert.equal(consentStore("accepted").getConsentSnapshot(), null);
  assert.equal(consentStore("declined").getConsentSnapshot(), null);
  assert.equal(consentStore("invalid").getConsentSnapshot(), null);
  assert.equal(consentStore('{"version":1}').getConsentSnapshot(), null);
  assert.equal(consentStore(JSON.stringify({version: 3, analytics: true, marketing: true, functional: true, timestamp: new Date().toISOString()})).getConsentSnapshot(), null);
});

test("consent subscribers update immediately even when storage is blocked", () => {
  const store = consentStore(null, true);
  const choice = {
    version: 4,
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
  assert.equal(checked, 2);
});

test("expired or malformed consent never enables optional tracking", () => {
  const base = { version: 4, analytics: true, marketing: true, functional: true, timestamp: new Date().toISOString() };
  assert.equal(consentStore(JSON.stringify(base)).getConsentSnapshot().analytics, true);
  for (const change of [{analytics:"yes"}, {timestamp:"invalid"}, {timestamp:"2020-01-01T00:00:00Z"}, {version:2}]) {
    assert.equal(consentStore(JSON.stringify({...base,...change})).getConsentSnapshot(), null);
  }
});

test('lead analytics and ads conversions respect separate consent and exclude admin activity',()=>{
 const source=ts.transpileModule(readFileSync('src/lib/track-event.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 for(const [analytics,marketing,pathname] of [[false,false,'/pricing'],[true,false,'/pricing'],[false,true,'/pricing'],[true,true,'/pricing'],[true,true,'/dashboard']]){
  const sent=[];const context={exports:{},require:()=>({getConsentSnapshot:()=>({analytics,marketing})}),window:{location:{origin:'https://www.mistravora.com',pathname,search:'?email=private@example.com'},gtag:(...args)=>sent.push(args),mistravoraAnalyticsTarget:'G-TEST123',mistravoraAdsTarget:'AW-123/label'}};
  vm.runInNewContext(source,context);context.exports.trackEvent('generate_lead',{form_name:'project_requirements'});
  assert.equal(sent.filter(e=>e[1]==='generate_lead').length,analytics&&!pathname.startsWith('/dashboard')?1:0);
  assert.equal(sent.filter(e=>e[1]==='conversion').length,marketing&&!pathname.startsWith('/dashboard')?1:0);
  assert.equal(JSON.stringify(sent).includes('private@example.com'),false);
 }
});

test('tracking stays absent until enabled and unsafe or unsupported IDs never render',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);
 const source=ts.transpileModule(readFileSync('src/components/marketing-tags.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 async function render(settings){
  const context={exports:{},require:name=>name==='@/lib/services'?{getMarketingSettings:async()=>settings}:name==='@/components/marketing-events'?{MarketingEvents:()=>null}:name==='@/components/consent-gated-script'?{ConsentGatedScript:({category,children,src})=>React.createElement('div',{'data-category':category,'data-src':src},children)}:require(name)};
  vm.runInNewContext(source,context);return renderToStaticMarkup(await context.exports.MarketingTags());
 }
 const configured={enable_optional_tracking:'false',ga4_measurement_id:'G-TEST123',google_ads_conversion_id:'AW-12345',google_ads_conversion_label:'Lead_123'};
 assert.equal(await render(configured),'');
 const active=await render({...configured,enable_optional_tracking:'true'});
 assert.ok(active.includes('data-category="analytics"'));assert.ok(active.includes('data-category="marketing"'));assert.ok(active.includes('send_page_view:false'));assert.ok(active.includes('AW-12345/Lead_123'));
 assert.equal(await render({...configured,enable_optional_tracking:'true',ga4_measurement_id:"G-BAD'",google_ads_conversion_id:'not-an-id'}),'');
});
