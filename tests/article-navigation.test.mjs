import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(file){const context={exports:{},URL,require:name=>name==='./content-preview'?load('src/lib/content-preview.ts'):require(name)};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,context);return context.exports;}
const {articleNavigation}=load('src/lib/article-navigation.ts');
const prose='<p>'+('Useful article text. '.repeat(150))+'</p>';
test('long article navigation preserves authored anchors and avoids ID collisions',()=>{
 const html='<div id="article-test-section-1"></div><h2 id="intro">Intro &amp; scope</h2><h2>Methods</h2><h3>Findings</h3><h2>Limits</h2>'+prose;
 const result=articleNavigation(html,'article-test');
 assert.equal(result.headings.length,4);assert.equal(result.headings[0].id,'intro');assert.equal(result.headings[0].text,'Intro & scope');assert.equal(result.headings[1].id,'article-test-section-2');
 for(const heading of result.headings)assert.ok(result.html.includes(`id="${heading.id}"`));
 assert.ok(result.html.includes('<h2 id="intro">'));
});
test('short content stays unchanged and duplicate or unsafe authored IDs are not linked twice',()=>{
 const short='<h2>Short</h2><p>Text</p>';assert.equal(articleNavigation(short,'article-test').html,short);
 const result=articleNavigation('<h2 id="same">One</h2><h2 id="same">Duplicate</h2><h2 id="bad id">Skip</h2><h2>Two</h2><h3>Three</h3><h2>Four</h2>'+prose,'article-test');
 assert.equal(result.headings.length,4);assert.equal(result.headings.filter(h=>h.id==='same').length,1);
 assert.ok(result.html.includes('id="bad id"'));
});
