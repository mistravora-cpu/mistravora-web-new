import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
test('robot resumes after stalled preparation and respects context loss and cleanup',async()=>{
 const source=readFileSync('src/components/ui/robot-hero.tsx','utf8');
 const code=source.slice(source.indexOf('function SceneLifecycle('),source.indexOf('export interface RobotHeroProps'))+'\nSceneLifecycle({onFrameloopChange});';
 const canvas=new EventTarget(),window=new EventTarget(),document=new EventTarget();
 canvas.getBoundingClientRect=()=>({top:0,bottom:500});window.innerHeight=800;
 const motion=new EventTarget();motion.matches=false;window.matchMedia=()=>motion;document.visibilityState='visible';
 const resets=[];
 const frames=[],timers=new Map();let timerId=0,cleanup,onIntersection;
 vm.runInNewContext(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,{
  window,document,Promise,IntersectionObserver:class{constructor(callback){onIntersection=callback;}observe(){}disconnect(){}},
  setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
  onFrameloopChange:mode=>frames.push(mode),
  useEffect:fn=>{cleanup=fn();},useThree:()=>({gl:{domElement:canvas,extensions:{has:()=>true},compileAsync:()=>new Promise(()=>{})},scene:{},camera:{},pointer:{set:(...point)=>resets.push(point)},events:{connected:canvas},invalidate:()=>{}}),
 });
 assert.equal(frames.at(-1),'never');
 [...timers.values()][0]();assert.equal(frames.at(-1),'always');
 onIntersection([{isIntersecting:false}]);assert.equal(frames.at(-1),'never');
 onIntersection([{isIntersecting:true}]);assert.equal(frames.at(-1),'always');
 canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));assert.equal(frames.at(-1),'never');
 canvas.dispatchEvent(new Event('webglcontextrestored'));[...timers.values()][0]();assert.equal(frames.at(-1),'always');
 document.visibilityState='hidden';document.dispatchEvent(new Event('visibilitychange'));assert.equal(frames.at(-1),'never');
 document.visibilityState='visible';window.dispatchEvent(new Event('pageshow'));assert.equal(frames.at(-1),'always');
 motion.matches=true;motion.dispatchEvent(new Event('change'));assert.equal(frames.at(-1),'demand');
 canvas.dispatchEvent(new Event('pointerleave'));assert.deepEqual(resets.at(-1),[0,0]);
 const touch=new Event('pointerup');touch.pointerType='touch';canvas.dispatchEvent(touch);assert.equal(resets.length,2);
 const mouse=new Event('pointerup');mouse.pointerType='mouse';canvas.dispatchEvent(mouse);assert.equal(resets.length,2);
 canvas.dispatchEvent(new Event('pointercancel'));assert.equal(resets.length,3);
 cleanup();assert.equal(timers.size,0);
 canvas.dispatchEvent(new Event('pointerleave'));assert.equal(resets.length,3);
});
