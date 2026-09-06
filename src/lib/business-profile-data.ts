/** Public, editable business facts. Defaults only cover an unavailable initial CMS read. */
export const businessDefaults = {
  name: "Mistravora",
  url: "https://mistravora.com",
  description: "Mistravora is a digital solutions company founded in May 2025 by Husni and co-founded by Shakeel, delivering mobile applications, custom software, websites and end-to-end digital solutions for businesses of all sizes and industries. With no restriction to a single market or sector, Mistravora focuses on building practical, scalable and modern digital solutions around each client's requirements.",
  intro: "Mobile applications, custom software, websites and end-to-end digital solutions for individuals and businesses of all sizes, across industries and markets.",
  email: "info@mistravora.com",
  phone: "+94 77 330 6063",
  phoneHref: "+94773306063",
  whatsapp: "94773306063",
  address: "Sri Lanka",
  founder: "Husni",
  cofounder: "Shakeel",
  founded: "2025-05",
  coverage: "Across locations and markets, without restriction to a single geographic area.",
  customers: "Individuals, startups, small and medium businesses, growing companies and larger organizations, depending on project requirements.",
  industries: "Digital solutions across industries.",
  availability: "Available 24/7 for enquiries",
  response: "Responses within 24 hours",
  timezone: "Asia/Colombo",
  headline: "End-to-end digital solutions",
  tagline: "Built around your requirements",
  story: "Founded in May 2025 by Husni and co-founded by Shakeel, Mistravora is based in Sri Lanka and serves clients across locations and markets. We build practical, scalable and modern digital solutions around each client's requirements.",
  offering: "Mobile application development\nCustom software development\nWebsites and web applications\nBusiness software and management systems\nE-commerce solutions\nAI and automation solutions\nCRM and booking solutions where applicable\nUI/UX and digital product development\nCloud/deployment and technical solutions\nSEO and website optimization\nDigital marketing and related digital services",
  footer: "Practical digital solutions across industries and markets.",
};
export type BusinessProfile = typeof businessDefaults;
export const businessSettingFields = {
  site_intro: "intro", site_name: "name", site_description: "description", site_email: "email", site_phone: "phone",
  site_whatsapp: "whatsapp", site_address: "address", company_founder: "founder",
  company_cofounder: "cofounder", company_founded: "founded", service_coverage: "coverage",
  customer_types: "customers", industry_coverage: "industries", business_hours: "availability",
  response_expectation: "response", timezone: "timezone", site_headline: "headline",
  site_tagline: "tagline", company_story: "story", core_offering: "offering", footer_text: "footer",
} as const;
export const publicBusinessKeys = Object.keys(businessSettingFields);
export function businessProfileFromRows(rows: { key: string; value: string | null }[]): BusinessProfile {
  const profile: BusinessProfile = { ...businessDefaults };
  for (const { key, value } of rows) {
    if (!Object.hasOwn(businessSettingFields, key) || typeof value !== "string") continue;
    const field = businessSettingFields[key as keyof typeof businessSettingFields];
    profile[field] = value;
  }
  profile.phoneHref = profile.phone.replace(/[^+\d]/g, "");
  profile.whatsapp = profile.whatsapp.replace(/\D/g, "");
  return profile;
}
