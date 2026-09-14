import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file) {
  const context = { exports: {}, URL, AbortSignal, require: name => name.startsWith('./') ? load(`src/lib/${name.slice(2)}.ts`) : require(name) };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, context);
  return context.exports;
}
const {prepareReview, attachReviewDetails, reviewKey} = load('src/lib/reviews.ts');
const {saveReview} = load('src/lib/review-save.ts');
const genuine = { quote: 'Customer-approved quotation for testing only.', name: 'Test reviewer', source_name: 'Direct feedback', permission_confirmed: true, published: true, display_paths: ['/', '/projects/shopmate'] };
function database({ failMetadata = false, failPublish = false, failRow = false } = {}) {
  const rows = new Map(); const settings = new Map();
  const db = { from(table) {
    let action='read',values,filter;
    const q = {
      select:()=>q, in:(_,ids)=>{filter=ids;return q;}, eq:(_,id)=>{filter=[id];return q;}, abortSignal:()=>q,
      insert:data=>{action='insert';values=data;return q;}, update:data=>{action='update';values=data;return q;}, upsert:data=>{action='upsert';values=data;return q;},
      maybeSingle:async()=>({data:rows.get(filter?.[0])??null,error:null}),
      then(resolve) {
        if(table==='settings') {
          if(action==='upsert') {if(failMetadata)return Promise.resolve({error:{message:'offline'}}).then(resolve);settings.set(values.key,values.value);}
          return Promise.resolve({error:null,data:[...settings].filter(([key])=>!filter||filter.includes(key)).map(([key,value])=>({key,value}))}).then(resolve);
        }
        if(action!=='read'&&(failRow || (values.published===true&&failPublish)))return Promise.resolve({error:{message:'offline'}}).then(resolve);
        if(action==='insert')rows.set(values.id, {...values});
        if(action==='update')rows.set(filter[0],{...rows.get(filter[0]),...values});
        return Promise.resolve({error:null,data:[...rows.values()]}).then(resolve);
      }
    };return q;
  }};
  return {db,rows,settings};
}

test('reviews never invent a rating or assume publication permission', () => {
  const draft=prepareReview({quote:'Actual feedback',name:'Customer'});
  assert.equal(draft.row.rating,0);assert.equal(draft.row.published,false);assert.equal(draft.details.permission_confirmed,false);
  assert.ok(prepareReview({...genuine,permission_confirmed:false}).error);
  assert.ok(prepareReview({...genuine,source_name:''}).error);
  assert.ok(prepareReview({...genuine,display_paths:[]}).error);
});
test('review source, media, dates, ratings and display paths are validated', () => {
  for (const patch of [{source_url:'javascript:alert(1)'},{source_url:'https://private:password@example.com'},{source_url:'http://example.com'},{avatar:'data:text/html,test'},{rating:6},{rating:-1},{rating:4.5},{review_date:'2026-02-30'},{review_date:'2999-01-01'},{display_paths:['//evil.test']},{display_paths:['/dashboard']},{display_paths:['/projects/shopmate?admin=1']}])assert.ok(prepareReview({...genuine,...patch}).error,JSON.stringify(patch));
  assert.equal(prepareReview({...genuine,source_url:'https://reviews.example.com/public/123',review_date:'2025-05-20',rating:4}).error,undefined);
});
test('only approved matching content is exposed; malformed or stale metadata fails closed', async () => {
  const {db,settings}=database();const prepared=prepareReview(genuine);const row={...prepared.row,id:'review'};
  assert.equal((await attachReviewDetails([row],db,true)).length,0);
  settings.set(reviewKey(row.id),JSON.stringify(prepared.details));
  assert.equal((await attachReviewDetails([row],db,true)).length,1);
  assert.equal((await attachReviewDetails([{...row,quote:'Unapproved edit'}],db,true)).length,0);
  assert.equal((await attachReviewDetails([{...row,published:false}],db,true)).length,0);
  settings.set(reviewKey(row.id),'not json');assert.equal((await attachReviewDetails([row],db,true)).length,0);
});
test('new reviews round trip with selected pages, optional rating and source attribution', async () => {
  const {db,rows}=database();const result=await saveReview(db,genuine);
  assert.equal(result.error,null);assert.ok(result.savedId);
  const [review]=await attachReviewDetails([...rows.values()],db,true);
  assert.equal(review.source_name,genuine.source_name);assert.equal(review.rating,0);assert.equal(review.display_paths.join(','),'/,/projects/shopmate');
});
test('metadata and publication failures leave drafts with an ID for a safe retry', async () => {
  for(const option of [{failMetadata:true},{failPublish:true}]){
    const {db,rows}=database(option);const result=await saveReview(db,genuine);
    assert.ok(result.error);assert.ok(result.savedId);assert.equal(result.changed,true);
    assert.equal(rows.get(result.savedId).published,false);assert.equal((await attachReviewDetails([...rows.values()],db,true)).length,0);
  }
  const {db,rows}=database({failRow:true});assert.equal((await saveReview(db,genuine)).changed,false);assert.equal(rows.size,0);
});
test('admin quick toggles preserve review details and cannot publish old unapproved samples', async () => {
  const {db,rows}=database();const created=await saveReview(db,{...genuine,published:false});
  assert.equal((await saveReview(db,{published:true},created.savedId)).error,null);
  const [publicReview]=await attachReviewDetails([...rows.values()],db,true);assert.equal(publicReview.quote,genuine.quote);
  assert.equal((await saveReview(db,{published:false},created.savedId)).error,null);
  assert.equal((await attachReviewDetails([...rows.values()],db,true)).length,0);
  rows.set('legacy',{...prepareReview(genuine).row,id:'legacy',published:false});
  assert.ok((await saveReview(db,{published:true},'legacy')).error);
});
