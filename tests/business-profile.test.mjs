import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = readFileSync('src/lib/business-profile-data.ts', 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { businessProfileFromRows } = context.exports;
test('public profile accepts CMS edits but never serializes secret or unknown settings', () => {
 const p = businessProfileFromRows([{key:'company_founder',value:'Updated founder'}, {key:'site_email',value:'new@example.com'}, {key:'meta_capi_token',value:'secret-marker'}, {key:'__proto__',value:'bad'}, {key:'site_phone',value:'+94 77 330 6063'}, {key:'site_whatsapp',value:'+94 77 330 6063'}]);
 assert.equal(p.founder, 'Updated founder'); assert.equal(p.email,'new@example.com'); assert.equal(p.phoneHref,'+94773306063'); assert.equal(p.whatsapp,'94773306063'); assert.ok(!JSON.stringify(p).includes('secret-marker')); assert.equal(p.meta_capi_token,undefined);
});
test('public feature switches preserve disabled values and default unset switches', () => {
 const p = businessProfileFromRows([{key:'enable_chat_widget',value:'false'},{key:'enable_newsletter',value:'false'},{key:'enable_cookie_consent',value:'false'},{key:'show_business_hours',value:'false'},{key:'site_title',value:'CMS title'}]);
 assert.equal(p.chatEnabled,'false');assert.equal(p.newsletterEnabled,'false');assert.equal(p.cookieBannerEnabled,'false');assert.equal(p.showHours,'false');assert.equal(p.seoTitle,'CMS title');
 assert.equal(businessProfileFromRows([{key:'enable_chat_widget',value:''}]).chatEnabled,'true');
});
