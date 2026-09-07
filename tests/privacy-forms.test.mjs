import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(file){const context={exports:{},require:(name)=>{
 if(name==='@/lib/rate-limit')return {checkRateLimit:()=>null,RATE_LIMITS:{contact:{},newsletter:{}}};
 if(name.includes('supabase'))throw Error('Rejected requests must not access the database');
 return require(name);
}};
// Lazy database mocks ensure imports are safe but any write is a test failure.
context.require=(name)=>name==='@/lib/supabase/server'?{createClient:()=>{throw Error('Database accessed');}}:name==='@/lib/supabase/admin'?{createAdminClient:()=>{throw Error('Database accessed');}}:name==='@/lib/rate-limit'?{checkRateLimit:()=>null,RATE_LIMITS:{contact:{},newsletter:{}}}:require(name);
vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,context);return context.exports;}
test('newsletter and booking reject submissions without affirmative form choice',async()=>{
 for(const [path,body] of [['src/app/api/newsletter/route.ts',{email:'test@example.com'}],['src/app/api/bookings/route.ts',{slot:'d4da6f74-9c16-414b-b42a-2f1a7800590a',name:'Test Person',email:'test@example.com'}]]){
  const api=load(path);const result=await api.POST(new Request('https://example.com/api/form',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(result.status,400);
 }
});
test('article HTML removes active embeds and tracking pixels while preserving headings and safe links',()=>{
 const {safeArticleHtml}=load('src/lib/article-html.ts');
 const html=safeArticleHtml('<h2>Study</h2><script>steal()</script><iframe src="https://tracker.example"></iframe><img src="https://tracker.example/pixel"><a href="javascript:alert(1)" onclick="steal()">Bad</a><a href="https://example.com">Source</a>');
 assert.ok(html.includes('<h2>Study</h2>'));assert.ok(html.includes('href="https://example.com"'));assert.ok(!/script|iframe|img|onclick|javascript:|steal/.test(html));
});

test('styled articles preserve internal CSS but remove JavaScript and external embeds', () => {
 const {articleDocument, hasArticleStyles} = load('src/lib/article-html.ts');
 const document = articleDocument('<style>.intro{color:red}</style><p class="intro" style="margin:1rem" onclick="alert(1)">Article</p><script>alert(1)</script><iframe src="https://example.com"></iframe>');
 assert.ok(hasArticleStyles('<style>p{color:red}</style>'));
 assert.equal(hasArticleStyles('<script>alert(1)</script>'), false);
 assert.ok(document.includes('.intro{color:red}'));
 assert.ok(document.includes('class="intro"'));
 assert.ok(document.includes('style="margin:1rem"'));
 assert.ok(document.includes("script-src 'none'"));
 assert.ok(!/<script|onclick|<iframe|alert\(1\)/.test(document));
});
