import type { CaseStudy, TrustedCompany } from "./types";

const companyKey = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

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
