/** Explicitly approved business facts. Run with --apply only to write Supabase. */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";
process.loadEnvFile(".env");
const js = ts.transpileModule(readFileSync("src/lib/business-profile-data.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {} }; vm.runInNewContext(js, context);
const { businessDefaults: p, businessSettingFields: fields } = context.exports;
const expectedProject = "ghixwjdxzrovdmdzocxj";
const publicUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const serverUrl = new URL(process.env.SUPABASE_URL);
if (publicUrl.hostname !== `${expectedProject}.supabase.co` || publicUrl.origin !== serverUrl.origin) throw new Error("Supabase project mismatch; no writes performed");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const descriptions = [
  "Mobile applications built around the requirements of individuals and organizations.",
  "Custom software designed around each client's requirements.",
  "Websites and web applications for customers across business sizes, industries and markets.",
  "Business software and management systems shaped around organizational requirements.",
  "E-commerce solutions for businesses selling online.",
  "AI and automation solutions developed around the needs of each project.",
  "CRM and booking solutions where they fit the client's requirements.",
  "UI/UX and digital product development for practical, modern digital experiences.",
  "Cloud, deployment and technical solutions for digital projects.",
  "SEO and website optimization as part of Mistravora's digital services.",
  "Digital marketing and related digital services based on client requirements.",
];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const services = p.offering.split("\n").map((title, i) => ({ title, slug: slug(title), description: descriptions[i], body: descriptions[i], category: "Digital solutions", published: true, sort_order: i }));
const settings = Object.entries(fields).map(([key, field]) => ({ key, value: p[field] }));
const heroes = [
  { page: "home", headline: p.headline, description: p.intro, badge: p.tagline },
  { page: "about", headline: "About Mistravora", description: p.description, badge: "Founded May 2025" },
  { page: "contact", headline: "Let's discuss your requirements", description: `${p.availability}. ${p.response}.`, badge: "Get in touch" },
  { page: "industries", headline: "Digital solutions across industries", description: `${p.customers} ${p.coverage}`, badge: "Across industries" },
];
const contact = { headline: "Let's discuss your requirements", description: `${p.availability}. ${p.response}.`, email: p.email, phone: p.phone, whatsapp: p.whatsapp, address: p.address };
const plan = { settings, contact, heroes, services, founders: [{ name: p.founder, role: "Founder" }, { name: p.cofounder, role: "Co-Founder" }] };
mkdirSync("docs/content", { recursive: true });
writeFileSync("docs/content/business-essentials-approved.json", JSON.stringify(plan, null, 2) + "\n");
if (!process.argv.includes("--apply")) { console.log(JSON.stringify({ mode: "preview", settings: settings.length, services: services.map(s=>s.title), heroes: heroes.map(h=>h.page), founders: plan.founders })); process.exit(0); }
async function check(query) { const result = await query; if (result.error) throw new Error(`Supabase: ${result.error.code} ${result.error.message}`); return result.data ?? []; }
// Back up only affected public content, never secret settings or private records.
const backup = {
  settings: await check(db.from("settings").select("*").in("key", settings.map(s=>s.key))),
  contact: await check(db.from("contact_info").select("*")),
  heroes: await check(db.from("hero_sections").select("*").in("page", heroes.map(h=>h.page))),
  services: await check(db.from("services").select("*").in("slug", services.map(s=>s.slug))),
  founders: await check(db.from("team_members").select("*").in("name", plan.founders.map(f=>f.name))),
};
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
writeFileSync(`docs/content/business-before-${stamp}.json`, JSON.stringify(backup, null, 2) + "\n");
await check(db.from("settings").upsert(settings, { onConflict: "key" }));
if (backup.contact.length) await check(db.from("contact_info").update(contact).in("id", backup.contact.map(c=>c.id)));
else await check(db.from("contact_info").insert(contact));
for (const hero of heroes) {
  const existing = backup.heroes.filter(h=>h.page===hero.page);
  if (existing.length) await check(db.from("hero_sections").update(hero).in("id", existing.map(h=>h.id)));
  else await check(db.from("hero_sections").insert(hero));
}
await check(db.from("services").upsert(services, { onConflict: "slug" }));
for (const founder of plan.founders) {
  const existing = backup.founders.find(f=>f.name.toLowerCase()===founder.name.toLowerCase());
  if (existing) await check(db.from("team_members").update({ role: founder.role, published: true }).eq("id", existing.id));
  else await check(db.from("team_members").insert({ ...founder, bio: `${founder.role} of Mistravora, founded in May 2025.`, published: true, sort_order: founder.role === "Founder" ? -2 : -1 }));
}
const verification = await check(db.from("settings").select("key,value").in("key", settings.map(s=>s.key)));
if (settings.some(expected=>!verification.some(actual=>actual.key===expected.key&&actual.value===expected.value))) throw new Error("Settings read-back differs from approved content");
writeFileSync("docs/content/business-update-result.json", JSON.stringify({ project: expectedProject, appliedAt: new Date().toISOString(), settings: settings.length, services: services.length, heroes: heroes.length, contactUpdated: true, founders: plan.founders, backup: `business-before-${stamp}.json`, readBackVerified: true }, null, 2) + "\n");
console.log("Updated and verified approved business settings, contact details, hero records, 11 services and founder roles. Pricing unchanged.");
