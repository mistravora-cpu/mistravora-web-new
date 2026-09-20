import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

test('contact click events omit phone numbers, email addresses and URL queries', () => {
  const listeners={}, events=[];
  const context={exports:{}, URL, WeakSet, window:{location:{href:'https://www.mistravora.com/',origin:'https://www.mistravora.com'},addEventListener(){},removeEventListener(){}},document:{addEventListener(name,fn){listeners[name]=fn;},removeEventListener(){}},require(name){
    if(name==='react')return {useEffect:fn=>fn(),useRef:value=>({current:value})};
    if(name==='next/navigation')return {usePathname:()=>'/'};
    if(name==='next/web-vitals')return {useReportWebVitals(){}};
    if(name==='@/lib/track-event')return {trackEvent:(name,data)=>events.push({name,data})};
    if(name==='@/lib/attribution')return {captureAttribution(){}};
    if(name==='@/lib/consent')return {subscribeConsent:()=>()=>{},getConsentSnapshot:()=>null};
    throw Error(name);
  }};
  vm.runInNewContext(ts.transpileModule(readFileSync('src/components/marketing-events.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
  context.exports.MarketingEvents();
  for(const href of ['https://wa.me/94773306063?text=private','https://api.whatsapp.com/send?phone=94773306063','mailto:private@example.com','tel:+94773306063'])listeners.click({target:{closest:()=>({href,dataset:{}})}});
  assert.deepEqual(events.map(e=>e.data.destination),['whatsapp','whatsapp','mailto:','tel:']);
  assert.ok(!JSON.stringify(events).includes('94773306063'));
  assert.ok(!JSON.stringify(events).includes('private'));
});
