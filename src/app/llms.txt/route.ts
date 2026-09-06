import { getBusinessProfile } from "@/lib/business-profile";
export const revalidate = 300;
export async function GET() {
  const p = await getBusinessProfile();
  return new Response(`# ${p.name}\n\n${p.description}\n\n## Business details\n\n- Founded: ${p.founded}\n- Founder: ${p.founder}\n- Co-Founder: ${p.cofounder}\n- Location: ${p.address}\n- Markets: ${p.coverage}\n- Customers: ${p.customers}\n- Industries: ${p.industries}\n- Email: ${p.email}\n- Phone: ${p.phone}\n- Availability: ${p.availability}\n- Response: ${p.response}\n\n## Services\n\n${p.offering.split("\n").filter(Boolean).map(s=>`- ${s}`).join("\n")}\n\n## Sources\n\n- ${p.url}/api/company\n- ${p.url}/services\n- ${p.url}/projects\n- ${p.url}/llms-full.txt\n- ${p.url}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
