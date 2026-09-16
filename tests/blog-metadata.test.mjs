import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const transpile = file => ts.transpileModule(readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const preview = { exports: {}, URL, require };
vm.runInNewContext(transpile('src/lib/content-preview.ts'), preview);
async function metadata(post) {
  const context = { exports: {}, require: name => {
    if (name === '@/lib/services') return { getPostBySlug: async () => post };
    if (name === '@/lib/site') return { site: { url: 'https://www.mistravora.com' } };
    if (name === '@/lib/content-preview') return preview.exports;
    if (name === '@/lib/seo') return { withSocialMetadata: value => value };
    if (name === '@/lib/seo-overrides') return { applySeoOverrides: async value => value };
    if (name === 'next/navigation') return { notFound: () => { throw Error('NEXT_HTTP_ERROR_FALLBACK;404'); } };
    return {};
  }};
  vm.runInNewContext(transpile('src/app/(public)/blog/[slug]/page.tsx'), context);
  return context.exports.generateMetadata({ params: Promise.resolve({ slug: 'example' }) });
}
test('missing articles terminate metadata rendering with a not-found response', async () => {
  await assert.rejects(() => metadata(null), /NEXT_HTTP_ERROR_FALLBACK;404/);
});
test('article metadata uses readable unique text from its excerpt or body', async () => {
  for (const excerpt of ['<p>Example <strong>article</strong> summary.</p>', '']) {
    const result = await metadata({ title: 'An example article', slug: 'example', excerpt,
      body: '<style>p{color:red}</style><p>Body summary.</p>' });
    assert.equal(result.description, excerpt ? 'Example article summary.' : 'Body summary.');
    assert.equal(result.openGraph.description, result.description);
    assert.equal(result.twitter.description, result.description);
  }
});

test('sparse metadata can use real page copy without overriding a complete summary', () => {
  const { contentDescription } = preview.exports;
  assert.equal(contentDescription('Policy — version 1.', '<style>p{color:red}</style><p>How we handle enquiries, cookies and personal data.</p>'), 'How we handle enquiries, cookies and personal data.');
  const summary = 'Mistravora develops software and websites around business requirements. Discuss project scope, integrations and delivery with the team.';
  assert.equal(contentDescription(summary, 'Different body copy '.repeat(30)), summary);
  assert.equal(contentDescription('', ''), '');
});
