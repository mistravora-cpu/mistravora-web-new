import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(path,require=()=>{}){const ctx={exports:{},require,URL,AbortSignal};vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,ctx);return ctx.exports;}
const {attachProjectLinks}=load('src/lib/project-links.ts',()=>load('src/lib/media-url.ts'));
test('project link reads are limited to selected projects and explicit clears override old columns',async()=>{
 let keys,selection;
 const query={select:value=>{selection=value;return query;},in:(_,values)=>{keys=values;return query;},abortSignal:async()=>({data:[{key:'project_public_link:one',value:''},{key:'project_public_link:two',value:'https://example.com/new'}],error:null})};
 const result=await attachProjectLinks([{id:'one',website_url:'https://example.com/old'},{id:'two'},{id:'three',website_url:'javascript:alert(1)'}],{from:table=>{assert.equal(table,'settings');return query;}});
 assert.equal(selection,'key,value');assert.equal(keys.join(','),'project_public_link:one,project_public_link:two,project_public_link:three');
 assert.equal(result[0].website_url,null);assert.equal(result[1].website_url,'https://example.com/new');assert.equal(result[2].website_url,null);
});
