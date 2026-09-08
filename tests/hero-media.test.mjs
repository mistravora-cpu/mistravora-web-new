import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const schemaContext={exports:{},URL,require};
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/hero-media-config.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,schemaContext);
const {heroMediaSchema,parseHeroMedia}=schemaContext.exports;
test('hero media accepts ordered images and videos for exact public paths and rejects unsafe content',()=>{
 const item={url:'https://cdn.example.com/image.webp',type:'image',alt:'Project screenshot'};
 assert.ok(heroMediaSchema.safeParse({'/projects/example':[item,{...item,type:'video',url:'https://cdn.example.com/hero.mp4'}]}).success);
 for(const data of [{'about':[item]}, {'/':[ {...item,url:'javascript:alert(1)'}]}, {'/':[ {...item,alt:''}]}, {'/':Array(13).fill(item)}]) assert.equal(heroMediaSchema.safeParse(data).success,false);
 assert.equal(Object.keys(parseHeroMedia('broken JSON')).length,0);
});
test('hero rotation runs only for visible images and cleans up on pause',()=>{
 let slots=[],cursor=0,pending=[],observer,activeTimers=new Map(),nextId=0,cleanups=[];
 const motion=new EventTarget();motion.matches=false;
 const document=new EventTarget();document.hidden=false;
 const context={exports:{},document,matchMedia:()=>motion,
  IntersectionObserver:class {constructor(callback){observer=callback;} observe(){} disconnect(){}},
  setTimeout:fn=>{activeTimers.set(++nextId,fn);return nextId;},clearTimeout:id=>activeTimers.delete(id),
  require:name=>name==='react'?{
   createContext:()=>({}),useContext:()=>({}),
   useState:initial=>{const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},
   useRef:()=>{const i=cursor++;if(!(i in slots))slots[i]={current:null};return slots[i];},
   useEffect:(fn,deps)=>{const i=cursor++;if(!slots[i]||deps.some((v,j)=>v!==slots[i][j])){pending.push(()=>{cleanups[i]?.();cleanups[i]=fn();});slots[i]=deps;}},
  }:name==='next/navigation'?{usePathname:()=>'/'}:require(name),
 };
 vm.runInNewContext(ts.transpileModule(readFileSync('src/components/hero-media.tsx','utf8')+'\nexport {MediaPlayer};',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const items=[{url:'https://cdn.example/a.webp',type:'image',alt:'A'},{url:'https://cdn.example/b.webp',type:'image',alt:'B'}];
 const render=()=>{cursor=0;context.exports.MediaPlayer({items});const effects=pending;pending=[];effects.forEach(fn=>fn());};
 render();assert.equal(activeTimers.size,0);
 observer([{isIntersecting:true}]);render();assert.equal(activeTimers.size,1);
 [...activeTimers.values()][0]();render();assert.equal(slots[0],1);
 document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));render();assert.equal(activeTimers.size,0);
 document.hidden=false;motion.matches=true;motion.dispatchEvent(new Event('change'));render();assert.equal(activeTimers.size,0);
 cleanups.forEach(fn=>fn?.());
});
