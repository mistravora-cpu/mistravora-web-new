import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.AUDIT_URL || 'http://127.0.0.1:3200';
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}}); const errors=[];const requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(base);await page.locator('canvas').waitFor({timeout:30000});await page.waitForTimeout(2000);
 assert.equal(await page.locator('h1').innerText(),'End-to-end digital solutions');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.ok((await page.locator('body').innerText()).includes('info@mistravora.com'));
 const adminRequests=requests.filter(u=>/\/(admin|dashboard)(?:[/?]|$)/.test(u));assert.deepEqual(adminRequests,[]);
 // Inspect all loaded application scripts for admin-only UI and the actual secret.
 process.loadEnvFile('.env'); let scanned=0;
 for(const url of [...new Set(requests.filter(u=>u.startsWith(base)&&/\.js(?:\?|$)/.test(u)))]) {
  const code=await (await page.request.get(url)).text();scanned++;
  assert.ok(!code.includes(process.env.SUPABASE_SERVICE_ROLE_KEY),'Service-role key leaked');
  assert.ok(!code.includes('Manage advertising pixels, analytics, search engine verification'),'Admin editor loaded');
  assert.ok(!code.includes('Save All Settings'),'Admin settings loaded');
 }
 await page.screenshot({path:'docs/audits/business-home-mobile.png'});
 for(const path of ['/about','/contact','/industries','/services']){await page.goto(base+path);await page.locator('h1:visible').waitFor();assert.equal(await page.locator('h1:visible').count(),1);}
 const company=await (await page.request.get(base+'/api/company')).json();assert.equal(company.founded,'2025-05');assert.equal(company.founder,'Husni');assert.equal(company.cofounder,'Shakeel');assert.equal(company.email,'info@mistravora.com');assert.equal(company.services.length,11);
 const dashboard=await page.request.get(base+'/dashboard/settings',{maxRedirects:0});assert.ok([307,308].includes(dashboard.status()));assert.ok(dashboard.headers().location.endsWith('/admin'));assert.match(dashboard.headers()['cache-control'],/no-store/);
 const result={testedAt:new Date().toISOString(),companyVerified:true,services:11,automaticRobot:true,noAdminRequests:true,clientScriptsScanned:scanned,secretLeak:false,unauthenticatedDashboardStatus:dashboard.status(),errors};assert.deepEqual(errors,[]);
 writeFileSync('docs/audits/business-security.json',JSON.stringify(result,null,2)+'\n');console.log(result);
} finally {await browser.close();}
