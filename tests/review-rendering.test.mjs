import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url);
function component(file, overrides={}) {
 const context={exports:{},require:name=>overrides[name]??require(name)};
 vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,context);
 return context.exports;
}
const base={id:'1',name:'Customer',quote:'Clear communication & helpful delivery.',role:'',rating:0,avatar:null,source_name:'Email feedback',source_url:'',review_date:'2025-05-25',display_paths:['/'],permission_confirmed:true};
function reviews(items) {
 return component('src/components/testimonials.tsx',{
  '@/lib/services':{getTestimonials:async()=>items},
  '@/components/content-image':({src,alt,...props})=>React.createElement('img',{src,alt,...props}),
 });
}
test('review cards render readable quotes once, with no invented rating or HTML injection',async()=>{
 const {Testimonials}=reviews([{...base,quote:'<script>do not run</script>'}]);
 const html=renderToStaticMarkup(await Testimonials({path:'/'}));
 assert.equal((html.match(/<blockquote/g)??[]).length,1);
 assert.equal(html.includes('out of 5 stars'),false);
 assert.equal(html.includes('<script>'),false);
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('Email feedback'));
 assert.match(html,/datetime="2025-05-25"/i);
});
test('reviews appear only on selected pages and long lists remain readable without duplication',async()=>{
 const {Testimonials}=reviews(Array.from({length:7},(_,i)=>({...base,id:String(i),name:`Customer ${i}`})));
 assert.equal(await Testimonials({path:'/services/other'}),null);
 const html=renderToStaticMarkup(await Testimonials({path:'/'}));
 assert.equal((html.match(/<blockquote/g)??[]).length,7);assert.ok(html.includes('<summary'));
 assert.equal(html.includes('iframe'),false);assert.equal(html.includes('<script'),false);
});
test('public review source links have accessible attribution and safe external link attributes',()=>{
 const {ReviewCard}=reviews([]);
 const html=renderToStaticMarkup(React.createElement(ReviewCard,{review:{...base,rating:4,source_name:'Google',source_url:'https://example.com/review'}}));
 assert.ok(html.includes('4 out of 5 stars'));assert.ok(html.includes('rel="noopener noreferrer nofollow"'));assert.ok(html.includes('original review on Google'));
});
test('CMS statistics keep literal decimals and time formats and never invent percentages',()=>{
 const {StatsCounter}=component('src/components/stats-counter.tsx',{'@/components/scroll-reveal':{ScrollReveal:({children})=>React.createElement('div',null,children)}});
 const html=renderToStaticMarkup(React.createElement(StatsCounter,{stats:[{value:'0',label:'Zero'},{value:'100',label:'Count'},{value:'24/7',label:'Availability'},{value:'9.5',label:'Decimal'}]}));
 assert.ok(html.includes('24/7'));assert.ok(html.includes('9.5'));assert.equal(html.includes('100%'),false);assert.equal(html.includes('>50<'),false);
});
