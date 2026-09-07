import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const context={exports:{}};
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/company-images.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const {withProjectImages}=context.exports;
test('company row uses matching published project image and preserves logo fallback',()=>{
 const companies=[{name:' Unic  Motors ',logo:'https://cdn.example/old.webp'},{name:'ShopMate',logo:'https://cdn.example/logo.webp'}];
 const projects=[{client:'unic motors',published:false,cover_image:'https://cdn.example/private.webp'},{client:'UNIC MOTORS',published:true,cover_image:'https://cdn.example/new.webp'}];
 const result=withProjectImages(companies,projects);
 assert.equal(result[0].logo,'https://cdn.example/new.webp');
 assert.equal(result[1].logo,companies[1].logo);
 assert.equal(companies[0].logo,'https://cdn.example/old.webp');
 assert.equal(withProjectImages(companies,[])[0].logo,companies[0].logo);
});
test('known public brand and legal client names share project images',()=>{
 const result=withProjectImages([{name:'Dubai Store',logo:''},{name:'ShopMate',logo:''}], [
  {client:'The Dubai Store',published:true,cover_image:'https://cdn.example/dubai.webp'},
  {client:'ShopMate (Pvt) Ltd',published:true,cover_image:'https://cdn.example/shopmate.webp'},
 ]);
 assert.equal(result[0].logo,'https://cdn.example/dubai.webp');
 assert.equal(result[1].logo,'https://cdn.example/shopmate.webp');
});
