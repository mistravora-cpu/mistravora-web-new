import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(file){const context={exports:{},URL,require:(name)=>{
 if(name==='@/lib/rate-limit')return {checkRateLimit:()=>null,RATE_LIMITS:{contact:{},newsletter:{}}};
 if(name.includes('supabase'))throw Error('Rejected requests must not access the database');
 return require(name);
}};
// Lazy database mocks ensure imports are safe but any write is a test failure.
context.require=(name)=>name==='@/lib/supabase/server'?{createClient:()=>{throw Error('Database accessed');}}:name==='@/lib/supabase/admin'?{createAdminClient:()=>{throw Error('Database accessed');}}:name==='@/lib/rate-limit'?{checkRateLimit:()=>null,RATE_LIMITS:{contact:{},newsletter:{}}}:name.startsWith('./')?load('src/lib/'+name.slice(2)+'.ts'):require(name);
vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,context);return context.exports;}
test('newsletter and booking reject submissions without affirmative form choice',async()=>{
 for(const [path,body] of [['src/app/api/newsletter/route.ts',{email:'test@example.com'}],['src/app/api/bookings/route.ts',{slot:'d4da6f74-9c16-414b-b42a-2f1a7800590a',name:'Test Person',email:'test@example.com'}]]){
  const api=load(path);const result=await api.POST(new Request('https://example.com/api/form',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(result.status,400);
 }
});
test('article HTML removes scripts and embeds while preserving safe images and content',()=>{
 const {renderArticleHtml}=load('src/lib/article-html.ts');
 const {html,css}=renderArticleHtml('<style>body{color:red}.intro{color:blue;background:url(https://tracker.example)} @import "https://tracker.example/x.css";</style><h1>Study</h1><script>steal()</script><iframe src="https://tracker.example"></iframe><img src="https://example.com/photo.jpg" alt="Diagram"><img src="javascript:alert(1)"><a href="javascript:alert(1)" onclick="steal()">Bad</a>');
 assert.ok(html.includes('<h2>Study</h2>'));assert.ok(html.includes('alt="Diagram"'));assert.ok(html.includes('loading="lazy"'));
 assert.ok(!/<script|<iframe|onclick|javascript:|steal/.test(html));
 assert.ok(css.includes('[data-article-content]'));assert.ok(!/url|@import|tracker/.test(css));
});
test('article styles stay scoped and malformed CSS does not break publication',()=>{
 const {renderArticleHtml}=load('src/lib/article-html.ts');
 const {html,css}=renderArticleHtml('<style>h2,p{color:red}@media(max-width:600px){.intro{padding:1rem}}</style><p class="intro" style="position:fixed;color:blue">Text</p>');
 assert.ok(css.includes('[data-article-content] h2'));assert.ok(css.includes('[data-article-content] p'));
 assert.ok(html.includes('color:blue'));assert.ok(!html.includes('fixed'));
 assert.ok(renderArticleHtml('<style>p{</style><p>Still readable</p>').html.includes('Still readable'));
});
