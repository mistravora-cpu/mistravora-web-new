import type { CaseStudy, TrustedCompany } from "./types";

const aliases: Record<string, string> = {
  "the dubai store": "dubai store",
  "shopmate (pvt) ltd": "shopmate",
};
const companyKey = (name: string) => {
  const key = name.trim().replace(/\s+/g, " ").toLowerCase();
  return aliases[key] ?? key;
};

export function withProjectImages(companies: TrustedCompany[], projects: CaseStudy[]) {
  const images = new Map<string, string>();
  for (const project of projects) {
    if (!project.published || !project.client || !project.cover_image?.trim()) continue;
    const key = companyKey(project.client);
    if (!images.has(key)) images.set(key, project.cover_image.trim());
  }
  return companies.map(company => ({
    ...company,
    logo: images.get(companyKey(company.name)) || company.logo,
  }));
}
