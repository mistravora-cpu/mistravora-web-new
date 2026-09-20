import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
function load(file){const c={exports:{},URL,require:n=>n==='./content-preview'?load('src/lib/content-preview.ts'):require(n)};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,c);return c.exports;}
const {filterArticles}=load('src/lib/article-filter.ts');
const rows=[{title:'Mobile apps',category:'Engineering',tags:['PWA']},{title:'Search guide',category:'Marketing',summary:'<p>Search visibility</p>'}];
test('article filters combine category and readable case-insensitive search without modifying source order',()=>{
 assert.equal(filterArticles(rows,{q:'pwa',category:'Engineering'}).rows[0],rows[0]);
 assert.equal(filterArticles(rows,{q:'VISIBILITY'}).rows[0],rows[1]);
 assert.equal(filterArticles(rows,{category:'unknown'}).rows.length,0);
 assert.equal(filterArticles(rows,{q:'pwa',category:'Marketing'}).rows.length,0);
 assert.equal(filterArticles(rows,{}).rows.length,2);
 assert.equal(rows[0].title,'Mobile apps');
});
test('repeated query parameters are ignored and search input is bounded',()=>{
 assert.equal(filterArticles(rows,{q:['a','b'],category:['x']}).rows.length,2);
 assert.equal(filterArticles(rows,{q:'x'.repeat(300)}).q.length,150);
 assert.equal(filterArticles([],{q:'none'}).rows.length,0);
});
