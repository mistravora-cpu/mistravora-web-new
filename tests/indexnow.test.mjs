import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, overrides = {}, globals = {}) {
  const context = { exports: {}, URL, AbortSignal, ...globals, require(name) {
    if (name in overrides) return overrides[name];
    if (name.startsWith('./')) return load(`src/lib/${name.slice(2)}.ts`);
    throw Error(`Unexpected dependency: ${name}`);
  }};
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
  return context.exports;
}
const config = load('src/lib/indexnow-config.ts');
const plain = value => JSON.parse(JSON.stringify(value));

function harness(options = {}) {
  const calls = [], writes = [], tasks = [], reads = [];
  let row = options.row ?? { slug: 'example', published: true };
  const publicDb = { from(table) {
    reads.push(table);
    const q = { select: () => q, eq: () => q, abortSignal: () => q,
      maybeSingle: async () => ({ data: row, error: options.readError ? { message: 'Offline' } : null }) };
    return q;
  }};
  const adminDb = { from(table) {
    assert.equal(table, 'settings');
    const q = { select: () => q, eq: () => q, abortSignal: () => q,
      upsert(value) { writes.push(value); return q; },
      maybeSingle: async () => ({ data: { value: options.last ? JSON.stringify(options.last) : null }, error: null }),
      then: resolve => Promise.resolve({ error: options.writeError ? { message: 'Offline' } : null }).then(resolve),
    };
    return q;
  }};
  const api = load('src/lib/indexnow.ts', {
    'server-only': {},
    'next/server': { after: fn => tasks.push(fn) },
    './supabase/public': { createPublicClient: () => publicDb },
    './supabase/admin': { createAdminClient: () => adminDb },
    '@/app/sitemap': { default: async () => [{ url: `${config.indexNowConfig.origin}/` }, { url: `${config.indexNowConfig.origin}/services` }] },
  }, {
    process: { env: { VERCEL_ENV: options.environment ?? 'production' } },
    fetch: async (url, init) => {
      calls.push({ url, init });
      if (options.networkError) throw Error('Network failed');
      if (!init.method) return { ok: true, text: async () => options.badKey ? 'invalid' : `${config.indexNowConfig.key}\n` };
      return { status: options.httpStatus ?? 200 };
    },
  });
  return { api, calls, writes, tasks, reads, setRow: value => { row = value; }, async flush() { for (const task of tasks) await task(); } };
}

test('IndexNow uses the supplied public ownership file and canonical HTTPS host', () => {
  const payload = config.indexNowPayload(['/pricing#estimate', '/pricing/', '/pricing', '/']);
  assert.equal(readFileSync(`public/${payload.key}.txt`, 'utf8').trim(), payload.key);
  assert.equal(payload.host, 'www.mistravora.com');
  assert.equal(payload.keyLocation, `https://www.mistravora.com/${payload.key}.txt`);
  assert.deepEqual(plain(payload.urlList), ['https://www.mistravora.com/pricing', 'https://www.mistravora.com/']);
});

test('URL boundary excludes private data, foreign hosts, files, query tokens and old redirects', () => {
  const bad = ['/api/requirements/secret', '/dashboard', '/admin', '/search?q=email', '/services?email=private@example.com',
    '/pricing?token=private', '//example.org/services', 'https://mistravora.com/blog', 'http://www.mistravora.com/',
    'https://user:password@www.mistravora.com/', '/blog/photo.jpg', '/blog/%2Fadmin', '/blog/\\secret', '/tools/cost-calculator/',
    'javascript:alert(1)', '/blog/\nsecret'];
  assert.deepEqual(plain(config.indexNowUrls(bad)), []);
  assert.throws(() => config.indexNowPayload(bad));
  assert.throws(() => config.indexNowPayload(Array.from({ length: 10001 }, (_, i) => `/blog/post-${i}`)));
});

test('development and preview perform no indexing requests or public database reads', async () => {
  for (const environment of ['development', 'preview']) {
    const h = harness({ environment });
    assert.equal((await h.api.submitIndexNowSitemap()).ok, false);
    assert.deepEqual(plain(await h.api.captureIndexNowPaths('posts', 'id')), []);
    h.api.queueIndexNow('settings');
    assert.equal(h.tasks.length + h.calls.length + h.writes.length + h.reads.length, 0);
  }
});

test('publication checks match actual tables and never submit drafts or scheduled articles', async () => {
  for (const row of [null, { slug: 'private', published: false }, { slug: 'future', published: true, published_at: '2999-01-01' }]) {
    const h = harness(); h.setRow(row);
    assert.deepEqual(plain(await h.api.captureIndexNowPaths('posts', 'id')), []);
  }
  const h = harness({ row: { slug: 'retail', archived: false } });
  assert.deepEqual(plain(await h.api.captureIndexNowPaths('industries', 'id')), ['/industries/retail']);
  h.setRow({ slug: 'retail', archived: true });
  assert.deepEqual(plain(await h.api.captureIndexNowPaths('industries', 'id')), []);
  h.setRow({ name: 'Example Person', published: true });
  assert.deepEqual(plain(await h.api.captureIndexNowPaths('team_members', 'id')), ['/about/team/example-person']);
  h.setRow({ slug: 'privacy', status: 'draft' });
  assert.deepEqual(plain(await h.api.captureIndexNowPaths('policies', 'id')), []);
});

test('renames and removals notify both catalogs and previously published URLs after saving', async () => {
  const h = harness({ row: { slug: 'old', published: true } });
  const previous = await h.api.captureIndexNowPaths('posts', 'id');
  h.setRow({ slug: 'new', published: true });
  h.api.queueIndexNow('posts', 'id', previous);
  assert.equal(h.calls.length, 0);
  await h.flush();
  const urls = JSON.parse(h.calls[1].init.body).urlList;
  for (const path of ['/blog', '/insights', '/blog/old', '/blog/new']) assert.ok(urls.includes(config.indexNowConfig.origin + path));
  const deleted = harness(); deleted.setRow(null);
  deleted.api.queueIndexNow('posts', undefined, previous);
  await deleted.flush();
  assert.ok(JSON.parse(deleted.calls[1].init.body).urlList.includes(config.indexNowConfig.origin + '/blog/old'));
});

test('operational data and unknown tables never queue IndexNow notifications', async () => {
  const h = harness();
  for (const table of ['inquiries', 'bookings', 'newsletter_subscribers', 'email_campaigns', 'media_library', 'admin_users']) {
    h.api.queueIndexNow(table, 'private-record', ['/dashboard/private']);
    assert.deepEqual(plain(await h.api.captureIndexNowPaths(table, 'private-record')), []);
  }
  assert.equal(h.tasks.length + h.reads.length, 0);
});

test('SEO changes include newly noindexed and previously configured paths as well as the sitemap', async () => {
  const h = harness({ row: { path: '/projects/current' } });
  h.api.queueIndexNow('page_seo', 'id', ['/projects/old']);
  await h.flush();
  const urls = JSON.parse(h.calls[1].init.body).urlList;
  for (const path of ['/', '/services', '/projects/current', '/projects/old']) assert.ok(urls.includes(config.indexNowConfig.origin + path));
});

test('IndexNow verifies the live key before POST and reports acceptance separately from indexing', async () => {
  for (const httpStatus of [200, 202, 403, 429, 500]) {
    const h = harness({ httpStatus });
    const result = await h.api.submitIndexNow(['/services']);
    assert.equal(result.ok, [200, 202].includes(httpStatus));
    assert.equal(result.status, httpStatus);
    assert.equal(h.calls[1].url, 'https://api.indexnow.org/indexnow');
    assert.equal(h.calls[1].init.method, 'POST');
    assert.equal(h.calls[1].init.redirect, 'error');
    assert.equal(JSON.parse(h.writes[0].value).status, httpStatus);
    if (httpStatus === 202) assert.match(result.message, /pending/);
  }
  const invalid = harness({ badKey: true });
  assert.equal((await invalid.api.submitIndexNow(['/'])).ok, false);
  assert.equal(invalid.calls.length, 1);
});

test('network and preparation failures are recorded without throwing from the content callback', async () => {
  const h = harness({ networkError: true });
  h.api.queueIndexNow('posts', 'id');
  await assert.doesNotReject(() => h.flush());
  assert.equal(JSON.parse(h.writes[0].value).ok, false);
  const read = harness({ readError: true });
  read.api.queueIndexNow('posts', 'id');
  await assert.doesNotReject(() => read.flush());
  assert.equal(read.calls.length, 0);
  assert.equal(JSON.parse(read.writes[0].value).ok, false);
  const snapshot = harness();
  snapshot.api.queueIndexNow('posts', 'id', null);
  await snapshot.flush();
  assert.match(JSON.parse(snapshot.writes.at(-1).value).message, /previous URL could not be read/);
});

test('manual submission requires admin authorization and observes a persistent cooldown', async () => {
  for (const authorized of [false, true]) {
    const calls = [];
    const action = load('src/app/dashboard/marketing/indexnow-actions.ts', {
      '@/lib/auth': { requireAdmin: async () => authorized ? { id: 'admin' } : null },
      '@/lib/indexnow': {
        getIndexNowStatus: async () => { calls.push('status'); return { checkedAt: new Date().toISOString() }; },
        submitIndexNowSitemap: async () => { calls.push('submit'); },
      },
    });
    assert.equal((await action.submitPublishedUrls()).ok, false);
    assert.deepEqual(calls, authorized ? ['status'] : []);
  }
});

test('manual retry includes removed URLs from the last failure alongside the current sitemap', async () => {
  const h = harness({ last: { ok: false, message: 'Retry', count: 2, checkedAt: '2026-01-01T00:00:00Z',
    urls: ['https://www.mistravora.com/blog/removed', 'https://foreign.example/private'] } });
  const action = load('src/app/dashboard/marketing/indexnow-actions.ts', {
    '@/lib/auth': { requireAdmin: async () => ({ id: 'admin' }) },
    '@/lib/indexnow': h.api,
  });
  assert.equal((await action.submitPublishedUrls()).ok, true);
  const urls = JSON.parse(h.calls[1].init.body).urlList;
  assert.ok(urls.includes('https://www.mistravora.com/blog/removed'));
  assert.ok(urls.includes('https://www.mistravora.com/services'));
  assert.ok(urls.every(url => url.startsWith('https://www.mistravora.com/')));
});
