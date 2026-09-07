import {createClient} from '@supabase/supabase-js';
import {readFileSync, writeFileSync} from 'node:fs';
process.loadEnvFile('.env');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(new URL(url).hostname!=='ghixwjdxzrovdmdzocxj.supabase.co')throw Error('Unexpected Supabase project');
const client=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const policies=JSON.parse(readFileSync('docs/legal/policy-content.json','utf8'));
const plan={project:'ghixwjdxzrovdmdzocxj',policies:policies.map(p=>p.slug),withhold:['testimonials','statistics','trusted_companies','case_studies','benefits'],reason:'No substantiating evidence/permissions supplied; preserve records for review'};
if(!process.argv.includes('--apply')){console.log(plan);process.exit(0);}
// Mutations only target previously reviewed public records, never customer data.
const reviewed=JSON.parse(readFileSync('/private/tmp/mistravora-public-legal-before.json','utf8'));
for(const table of plan.withhold){const ids=(reviewed[table]??[]).filter(x=>x.published).map(x=>x.id);if(ids.length){const {error}=await client.from(table).update({published:false}).in('id',ids);if(error)throw error;}}
const names=['Sarah','Ahmed','Fatima'];
for(const member of reviewed.team_members??[]){
 if(names.includes(member.name)){const {error}=await client.from('team_members').update({published:false}).eq('id',member.id);if(error)throw error;}
 if(member.name==='Shakeel'){const {error}=await client.from('team_members').update({bio:'Co-Founder of Mistravora, founded in May 2025.'}).eq('id',member.id);if(error)throw error;}
}
for(const faq of reviewed.faqs??[]){
 let answer;
 if(/cost/i.test(faq.question))answer='Request a written quotation for your requirements. Confirm scope, fees, taxes and third-party charges before commissioning work.';
 if(/long/i.test(faq.question))answer='The schedule depends on scope, client inputs and integrations. Request an agreed timeline for your project.';
 if(/maintenance/i.test(faq.question))answer='Discuss maintenance scope, fees and response arrangements with the team and confirm them in writing.';
 if(answer){const {error}=await client.from('faqs').update({answer}).eq('id',faq.id);if(error)throw error;}
}
for(const p of policies){const {error}=await client.from('policies').update({title:p.title,body:p.body,status:'active',version:'2.0'}).eq('slug',p.slug);if(error)throw error;}
const {data,error}=await client.from('policies').select('slug,body,status').in('slug',plan.policies);if(error)throw error;
for(const p of policies)if(!data.some(x=>x.slug===p.slug&&x.body===p.body&&x.status==='active'))throw Error('Policy readback failed');
writeFileSync('docs/legal/publishing-result.json',JSON.stringify({...plan,appliedAt:new Date().toISOString(),policyReadbackVerified:true},null,2)+'\n');
console.log('Updated four policies; withheld unverified public evidence; corrected placeholder biographies and commercial FAQs.');
