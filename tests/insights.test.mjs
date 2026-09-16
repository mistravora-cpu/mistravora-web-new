import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const source=ts.transpileModule(readFileSync('src/app/(public)/insights/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
async function render(counts){
 const rows=key=>Array.from({length:counts[key]||0},(_,id)=>({id}));
 const context={exports:{},require:name=>{
  if(name==='next/link')return function Link({children,...props}){return React.createElement('a',props,children);};
  if(name==='@/lib/seo-overrides')return {applySeoOverrides:x=>x};
  if(name==='@/lib/seo')return {pageMetadata:()=>({})};
  if(name==='@/components/content-page')return {ContentShell:({children})=>React.createElement('main',null,children)};
  if(name==='@/components/newsletter-signup')return {NewsletterSignup:()=>React.createElement('div',{'data-newsletter':true})};
  if(name==='@/lib/content')return {getCollection:async key=>rows(key)};
  if(name==='@/lib/services')return {getPublishedPosts:async()=>rows('blog'),getResearch:async published=>{assert.equal(published,true);return rows('research');},getCaseStudies:async published=>{assert.equal(published,true);return rows('projects');}};
  return require(name);
 }};
 vm.runInNewContext(source,context);
 return renderToStaticMarkup(await context.exports.default());
}
test('insights links only to collections with published content and updates when entries are added',async()=>{
 const before=await render({research:2,projects:7});
 assert.ok(before.includes('href="/research"'));assert.ok(before.includes('href="/projects"'));assert.ok(before.includes('href="/tools"'));
 for(const path of ['blog','knowledge-base','glossary','resources','authors'])assert.equal(before.includes(`href="/${path}"`),false);
 assert.ok(before.includes('data-newsletter'));
 const after=await render({blog:1,resources:2});
 assert.ok(after.includes('href="/blog"'));assert.ok(after.includes('href="/resources"'));assert.ok(after.includes('1 published entry'));
});
test('empty insights still provides search and a working tools destination',async()=>{
 const html=await render({});assert.ok(html.includes('action="/search"'));assert.ok(html.includes('href="/tools"'));assert.equal(html.includes('href="/research"'),false);
});
