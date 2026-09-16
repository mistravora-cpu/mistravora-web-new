// Equivalent data repair to migration 0043, for the existing Supabase project.
// Default is read-only; --apply updates only the exact reported legacy copy.
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';
process.loadEnvFile('.env');
const project = 'ghixwjdxzrovdmdzocxj';
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
if (url.hostname !== `${project}.supabase.co` || new URL(process.env.SUPABASE_URL).origin !== url.origin) throw Error('Supabase project mismatch');
const db = createClient(url.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const legacy = 'Transform your business with cutting-edge AI solutions. Mistravora delivers innovative technology to drive growth and efficiency.';
const replacements = {
  '/industries': 'Explore Mistravora software, websites and digital marketing for businesses across industries, with solutions tailored to your workflows and project requirements.',
  '/careers': 'Explore current opportunities at Mistravora, a software and digital marketing company based in Sri Lanka and working with clients worldwide.',
  '/blog/business-process-automation-guide': '',
};
async function read(query) {
  const { data, error } = await query.abortSignal(AbortSignal.timeout(10000));
  if (error) throw Error(error.message);
  return data;
}
const seo = await db.from('page_seo').select('id,path,title,description,canonical,noindex,updated_at')
  .in('path', Object.keys(replacements)).abortSignal(AbortSignal.timeout(10000));
const schemaMissing = ['PGRST205', '42P01'].includes(seo.error?.code);
if (seo.error && !schemaMissing) throw Error(seo.error.message);
const rows = seo.data ?? [];
const articles = await read(db.from('posts').select('slug,title,published,published_at').eq('slug', 'business-process-automation-guide'));
const edits = rows.filter(row => row.description.trim() === legacy);
const apply = process.argv.includes('--apply');
const report = { project, checkedAt: new Date().toISOString(), mode: apply ? 'apply' : 'preview', schemaMissing, rows, articles, matchedLegacyRows: edits.length };
if (apply) {
  if (schemaMissing) throw Error('Apply migration 0043 through Supabase SQL Editor or an authenticated CLI before running this data repair.');
  if (edits.length) writeFileSync(`/private/tmp/mistravora-bing-before-${Date.now()}.json`, JSON.stringify(edits, null, 2));
  for (const row of edits) {
    const changed = await read(db.from('page_seo').update({ description: replacements[row.path] })
      .eq('id', row.id).eq('updated_at', row.updated_at).eq('description', row.description).select('path,description'));
    if (changed.length !== 1) throw Error(`Concurrent edit on ${row.path}; stopped without overwriting it.`);
    const verified = await read(db.from('page_seo').select('description').eq('id', row.id));
    if (verified[0]?.description !== replacements[row.path]) throw Error(`Readback failed for ${row.path}`);
  }
  report.changedRecords = edits.length;
  report.readBackVerified = true;
  writeFileSync('docs/content/bing-metadata-verification.json', JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));
