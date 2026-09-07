import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load({authorized = true, fail = false} = {}) {
  const calls = [];
  const result = {error: fail ? {message: 'Write failed'} : null, data: {id: 'saved'}};
  const db = {auth: {getUser: async () => ({data: {user: authorized ? {id: 'admin'} : null}})}, from(table) {
    const query = {select: () => query, eq: () => query, maybeSingle: async () => ({data: {id: 'admin'}}),
      update: () => query, insert: () => query, delete: () => query, upsert: () => query,
      single: async () => result, then: (resolve) => Promise.resolve(table === 'admin_users' ? {data: {id: 'admin'}} : result).then(resolve)};
    return query;
  }};
  const context = {exports: {}, require: name => {
    if(name === '@/lib/media-url') return {isR2MediaUrl:()=>false};
    if(name === '@/lib/team-slug') return {normalizeTeamSlug:s=>s};
    if(name === '@/lib/calculator-config') return {calculatorSchema:{parse:v=>v}};
    if(name === 'next/cache') return {updateTag: tag => calls.push(['tag', tag]), revalidatePath: (...args) => calls.push(['path', ...args]), refresh: () => {throw Error('Do not downgrade client invalidation');}};
    if(name === '@/lib/supabase/server') return {createClient: async () => db};
    if(name === '@/lib/business-profile-data') return {publicBusinessKeys: []};
    if(name === '@/lib/research-slug') return {normalizeResearchSlug: s => s};
    return require(name);
  }};
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/dashboard/crud-actions.ts','utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText, context);
  return {actions: context.exports, calls};
}
for (const action of ['upsertRow', 'deleteRow', 'saveSettings']) {
  const args = action === 'upsertRow' ? ['policies', {title: 'Updated'}, 'existing'] : action === 'deleteRow' ? ['policies', 'existing'] : [{site_name: 'Mistravora'}];
  test(`${action} expires shared content only after an authorized successful write`, async () => {
    for(const options of [{}, {authorized:false}, {fail:true}]) {
      const {actions,calls} = load(options);
      const result = await actions[action](...args);
      if(options.authorized === false || options.fail) {assert.ok(result.error); assert.equal(calls.length,0);}
      else {assert.equal(result.error,null); assert.ok(calls.some(c=>c[0]==='tag' && c[1]==='public-data')); assert.ok(calls.some(c=>c[0]==='path' && c[1]==='/' && c[2]==='layout'));}
    }
  });
}
