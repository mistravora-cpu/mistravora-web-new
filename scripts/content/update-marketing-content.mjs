/** Targeted, repeatable copy update. Never creates customer reviews or changes publication flags. */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';
process.loadEnvFile('.env');
const expectedProject = 'ghixwjdxzrovdmdzocxj';
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
if (url.hostname !== `${expectedProject}.supabase.co` || new URL(process.env.SUPABASE_URL).origin !== url.origin) throw Error('Supabase project mismatch');
const db = createClient(url.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const intro = 'Software development, websites, mobile apps, SEO and digital marketing from Mistravora in Sri Lanka, serving businesses across industries and markets.';
const edits = [
  ['settings', 'key', 'site_title', {value: 'Mistravora — Software & Digital Marketing in Sri Lanka'}],
  ['settings', 'key', 'site_intro', {value: intro}],
  ['settings', 'key', 'site_description', {value: "Mistravora is a digital solutions company based in Sri Lanka, founded in May 2025 by Husni and co-founded by Shakeel. We deliver mobile applications, custom software, websites, SEO, digital marketing and end-to-end digital solutions for individuals and businesses of all sizes, across industries and markets."}],
  ['settings', 'key', 'footer_text', {value: 'Software, websites and digital marketing from Sri Lanka, for clients worldwide.'}],
  ['hero_sections', 'page', 'home', {description: intro}],
  ['services', 'slug', 'seo-and-website-optimization', {
    description: 'SEO and website optimization for businesses in Sri Lanka and worldwide. Discuss your website, audience and search goals with Mistravora.',
    body: `<h2>SEO and website optimization in Sri Lanka</h2>
<p>Mistravora provides SEO and website optimization as part of our end-to-end digital services. We work with businesses in Sri Lanka and across markets, shaping each project around the website, audience and commercial goals.</p>
<h2>What should you share with us?</h2>
<p>Send your website URL, the products or services you want customers to find, your target locations and languages, and the action you want visitors to take. Tell us about known website issues and previous optimization work. Share access securely only when it is needed.</p>
<h2>How do we agree the scope?</h2>
<p>We discuss the current website, search visibility, content and visitor experience before preparing a quotation. The agreed scope sets out the pages, technical changes, content work, responsibilities and measurement plan. Website development and ongoing marketing can be discussed together when your project needs both.</p>
<h2>How are results assessed?</h2>
<p>Agree the baseline, measures and review period before work begins. Relevant measures can include search impressions, qualified visits and enquiries. Rankings and traffic vary, so specific positions or results are not guaranteed.</p>
<h2>Ready to discuss your website?</h2>
<p><a href="/pricing?service=SEO%20and%20website%20optimization#estimate">Build your SEO project brief and request a quotation</a>, or <a href="/contact">contact Mistravora</a> with your website URL.</p>`,
  }],
  ['services', 'slug', 'digital-marketing-and-related-digital-services', {
    description: 'Digital marketing for businesses in Sri Lanka and worldwide, planned around your audience, offer, goals and budget. Discuss your requirements with Mistravora.',
    body: `<h2>Digital marketing for your business</h2>
<p>Mistravora provides digital marketing and related digital services alongside software development, websites and SEO. Based in Sri Lanka, we work with individuals, startups and organizations across industries and markets.</p>
<h2>Where does a marketing project start?</h2>
<p>Tell us what you sell, who you want to reach, where your customers are, and what you want them to do next. Your existing website, brand assets, previous campaigns and available budget help us discuss a practical scope.</p>
<h2>Which channels should you use?</h2>
<p>The channels, deliverables and responsibilities are agreed for each project. Tell us if your brief involves search visibility, paid search, social content, email or another channel so we can confirm the services available for your requirements. This page does not imply that every channel or platform is included in every engagement.</p>
<h2>Connect marketing with the customer journey</h2>
<p>A campaign needs a clear destination. Discuss the landing page, contact or booking flow, and how enquiries will be handled. Where software, CRM or website changes are needed, these can be scoped alongside the marketing work.</p>
<h2>Budget, measurement and expectations</h2>
<p>The written quotation confirms service fees, any separate advertising spend, timelines, deliverables and approval responsibilities. We agree how to assess progress using relevant enquiries and other agreed measures. Advertising results, search rankings and sales cannot be guaranteed.</p>
<p><a href="/pricing?service=Digital%20marketing#estimate">Plan your digital marketing requirements</a> or <a href="/contact">talk to our team</a>. You can also explore our <a href="/services/seo-and-website-optimization">SEO and website optimization service</a>.</p>`,
  }],
  ['faqs', 'id', '0c4c3f76-6b48-4bcd-81d7-909017e1bd1a', {answer: 'Mistravora provides mobile apps, custom software, websites, business systems, e-commerce, AI and automation, UI/UX, cloud and deployment support, SEO, and digital marketing. CRM and booking solutions can be included where they fit the project. We agree the exact deliverables for your requirements.'}],
  ['faqs', 'id', 'b77bf1bb-296a-4a81-bddb-44e0c14bc742', {answer: 'We provide AI and automation solutions where they fit your requirements. Share the workflow, the available data and the result you need. We confirm feasibility, data handling, integrations and costs before agreeing the scope.'}],
  ['faqs', 'id', '80885e8a-d917-4496-a6e0-aad42943a73b', {answer: '<p>The cost depends on scope, integrations and delivery needs. Use the <a href="/pricing#estimate">project requirements and estimate tool</a> to prepare your brief and request a preliminary quotation PDF. A 30% advance is required; final scope, fees, taxes, third-party costs and payment milestones are confirmed in the written quotation.</p>'}],
  ['value_cards', 'id', '678a0d18-686f-4b73-abbc-f9fcbc65e77b', {description: 'Plan clear page content, semantic markup, structured data and URLs that help people and search engines understand your website.'}],
  ['value_cards', 'id', 'c3da1385-7336-4e47-935e-d0738cd6d089', {description: 'Discuss AI assistants and automation where they can help your business workflow.'}],
];
async function check(query) { const result = await query; if (result.error) throw Error(result.error.message); return result.data; }
const planned = [];
for (const [table, key, value, changes] of edits) {
  const before = await check(db.from(table).select('*').eq(key, value).single());
  const changed = Object.entries(changes).some(([field, next]) => before[field] !== next);
  if (changed) planned.push({ table, key, value, changes, before });
}
if (!process.argv.includes('--apply')) { console.log(JSON.stringify({project: expectedProject, mode: 'preview', edits: planned.map(({table,key,value,changes}) => ({table,key,value,changes}))}, null, 2)); process.exit(0); }
const backup = `/private/tmp/mistravora-marketing-before-${Date.now()}.json`;
writeFileSync(backup, JSON.stringify(planned, null, 2));
for (const {table,key,value,changes,before} of planned) {
  // Compare the last edit timestamp to avoid clobbering a concurrent admin save.
  let query = db.from(table).update(changes).eq(key, value);
  if (before.updated_at) query = query.eq('updated_at', before.updated_at);
  const rows = await check(query.select(key));
  if (rows.length !== 1) throw Error(`Concurrent edit detected for ${table}/${value}; stopped without overwriting it.`);
  const after = await check(db.from(table).select(Object.keys(changes).join(',')).eq(key, value).single());
  if (Object.entries(changes).some(([field, next]) => after[field] !== next)) throw Error(`Readback failed for ${table}/${value}`);
}
writeFileSync('docs/content/reviews-marketing-data-result.json', JSON.stringify({project: expectedProject, appliedAt: new Date().toISOString(), changedRecords: planned.length, readBackVerified: true, customerReviewsCreated: 0, publicationFlagsChanged: 0}, null, 2)+'\n');
console.log(JSON.stringify({project: expectedProject, changedRecords: planned.length, readBackVerified: true, backup}));
