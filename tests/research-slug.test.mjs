import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const context={exports:{},URL};
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/research-slug.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
const normalize=context.exports.normalizeResearchSlug;
test('research slugs accept pasted paths without generating nested or double-slash URLs',()=>{
 for(const value of ['pwa-vs-native-apps','/pwa-vs-native-apps',' /research/PWA-vs-Native-Apps/ ','https://www.mistravora.com/research/pwa-vs-native-apps']) assert.equal(normalize(value),'pwa-vs-native-apps');
 for(const value of ['', '/', '../secret','a/b','hello?x=1','<script>','article name']) assert.equal(normalize(value),null);
});
