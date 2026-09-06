import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function setup({ admin = { id: 'admin-id' }, providerError = null, throws = false } = {}) {
  const updates = [];
  let clients = 0;
  const context = {
    exports: {},
    require: (name) => {
      if (name === '@/lib/auth') return { requireAdmin: async () => admin };
      if (name === '@/lib/supabase/server') return { createClient: async () => {
        clients++;
        return { auth: { updateUser: async (attributes) => {
          updates.push(attributes);
          if (throws) throw new Error('private provider details');
          return { error: providerError };
        } } };
      } };
      return require(name);
    },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/dashboard/settings/password-actions.ts','utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return { action: context.exports.changePassword, updates, clientCount: () => clients };
}
function form(overrides = {}) {
  const data = new FormData();
  for (const [key,value] of Object.entries({currentPassword:'existing-password',newPassword:'new-private-passphrase',confirmPassword:'new-private-passphrase',...overrides})) data.set(key,value);
  return data;
}
test('unauthorized password requests cannot reach authentication update', async () => {
  const s=setup({admin:null});
  assert.ok((await s.action(form())).error);
  assert.equal(s.clientCount(),0);
});
test('invalid password changes never reach Supabase', async () => {
  for(const changes of [{currentPassword:''},{newPassword:'short',confirmPassword:'short'},{confirmPassword:'different-passphrase'},{newPassword:'existing-password',confirmPassword:'existing-password'},{newPassword:'a'.repeat(129),confirmPassword:'a'.repeat(129)}]) {
    const s=setup();assert.ok((await s.action(form(changes))).error);assert.equal(s.updates.length,0);
  }
});
test('password update submits current-password proof and only changes own password', async () => {
  const s=setup();const result=await s.action(form());
  assert.equal(result.success,true);
  assert.equal(s.updates.length,1);
  assert.equal(s.updates[0].current_password,'existing-password');
  assert.equal(s.updates[0].password,'new-private-passphrase');
  assert.deepEqual(Object.keys(s.updates[0]).sort(),['current_password','password']);
  assert.ok(!JSON.stringify(result).includes('passphrase'));
});
test('wrong password and reauthentication failures never report success or leak provider details', async () => {
  for(const code of ['current_password_mismatch','reauthentication_needed','weak_password','unknown']) {
    const s=setup({providerError:{code,message:'private provider details'}});
    const result=await s.action(form());assert.ok(result.error);assert.ok(!result.success);assert.ok(!result.error.includes('private provider details'));
  }
  const result=await setup({throws:true}).action(form());assert.ok(result.error);assert.ok(!result.error.includes('private provider details'));
});
