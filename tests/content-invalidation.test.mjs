import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load({authorized = true, fail = false} = {}) {
  const calls = [];
  const writes = [];
  const result = {error: fail ? {message: 'Write failed'} : null, data: {id: 'saved'}};
  const db = {auth: {getUser: async () => ({data: {user: authorized ? {id: 'admin'} : null}})}, from(table) {
    const query = {select: () => query, eq: () => query, maybeSingle: async () => ({data: {id: 'admin'}}),
      update: data => {writes.push({table,data});return query;}, insert: data => {writes.push({table,data});return query;}, delete: () => query, upsert: data => {writes.push({table,data});return query;},
      single: async () => result, then: (resolve) => Promise.resolve(table === 'admin_users' ? {data: {id: 'admin'}} : result).then(resolve)};
    return query;
  }};
  const context = {exports: {}, require: name => {
    if(name === '@/lib/requirements/notification-config') return {quoteRecipientsSchema:{parse:v=>v}};
    if(name === '@/lib/requirements/schema') return {requirementConfigSchema:{parse:v=>v}};
    if(name === '@/lib/hero-media-config') return {heroMediaSchema:{parse:v=>v}};
    if(name === '@/lib/media-url') { const media = {exports:{}, URL}; vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/media-url.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, media); return media.exports; }
    if(name === '@/lib/team-slug') return {normalizeTeamSlug:s=>s};
    if(name === '@/lib/calculator-config') return {calculatorSchema:{parse:v=>v}};
    if(name === 'next/cache') return {updateTag: tag => calls.push(['tag', tag]), revalidatePath: (...args) => calls.push(['path', ...args]), refresh: () => {throw Error('Do not downgrade client invalidation');}};
    if(name === '@/lib/supabase/server') return {createClient: async () => db};
    if(name === '@/lib/business-profile-data') return {publicBusinessKeys: []};
    if(name === '@/lib/research-slug') return {normalizeResearchSlug: s => s};
    return require(name);
  }};
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/dashboard/crud-actions.ts','utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText, context);
  return {actions: context.exports, calls, writes};
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

test('image fields accept external HTTPS links and reject executable URLs', async () => {
  const {actions} = load();
  for (const url of ['https://images.example.com/photo.webp?width=800', 'https://cdn.example.org/image.jpg']) {
    const result = await actions.upsertRow('team_members', {photo:url}, 'existing');
    assert.equal(result.error, null);
  }
  for (const url of ['javascript:alert(1)', 'data:image/svg+xml,unsafe', 'https://user:password@example.com/image.jpg']) {
    assert.ok((await actions.upsertRow('team_members', {photo:url}, 'existing')).error);
  }
});

test('public project links save and clear without requiring a project-table column', async () => {
  for(const website_url of ['https://example.com/project', '']) {
    const {actions,writes} = load();
    const result = await actions.upsertRow('case_studies', {title:'Project',website_url}, 'project-id');
    assert.equal(result.error,null);
    assert.equal('website_url' in writes.find(row=>row.table==='case_studies').data,false);
    assert.equal(writes.find(row=>row.table==='settings').data.key,'project_public_link:project-id');
    assert.equal(writes.find(row=>row.table==='settings').data.value,website_url);
  }
  const {actions,writes}=load();
  assert.ok((await actions.upsertRow('case_studies',{website_url:'javascript:alert(1)'},'id')).error);
  assert.equal(writes.length,0);
});
