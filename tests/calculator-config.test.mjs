import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';import vm from 'node:vm';import ts from 'typescript';
const context={exports:{},require:createRequire(import.meta.url)};vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/calculator-config.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);const {calculatorSchema,calculatorDefaults}=context.exports;
test('calculator configuration rejects invalid prices, duplicate IDs and empty required lists',()=>{
 assert.ok(calculatorSchema.safeParse(calculatorDefaults).success);
 for(const config of [{...calculatorDefaults,usdRate:0},{...calculatorDefaults,projectTypes:[]},{...calculatorDefaults,timelines:[]},{...calculatorDefaults,projectTypes:[{id:'x',label:'X',base:-1}]},{...calculatorDefaults,features:[{id:'x',label:'X',price:1},{id:'x',label:'Y',price:2}]}])assert.equal(calculatorSchema.safeParse(config).success,false);
});
