import type { ReactNode } from "react";
import { Globe, Mail } from "lucide-react";
import {
  LinkedinIcon,
  GithubIcon,
  InstagramIcon,
  FacebookIcon,
  XIcon,
} from "@/components/brand-icons";
import type { TeamMember } from "@/lib/types";

export type SocialLink = {
  href: string;
  label: string;
  platform: string;
  icon: ReactNode;
  external: boolean;
};

export type TeamCategoryMeta = {
  key: string;
  title: string;
  description: string;
};

// Canonical category order + display metadata. Categories that have no
// members are not rendered. Any unknown category value falls into a generic
// bucket shown last so legacy/unknown rows still appear.
export const TEAM_CATEGORIES: TeamCategoryMeta[] = [
  { key: "senior", title: "Senior staff", description: "Leadership and senior engineers shaping Mistravora." },
  { key: "permanent", title: "Permanent staff", description: "The core team delivering every day." },
  { key: "advisor", title: "Advisors", description: "Trusted guides helping us steer the company." },
  { key: "contractor", title: "Contractors", description: "Specialist partners we work with." },
  { key: "intern", title: "Interns", description: "Rising talent growing with us." },
];

export function groupTeamByCategory(
  members: TeamMember[]
): { meta: TeamCategoryMeta; members: TeamMember[] }[] {
  const known = new Map<string, TeamMember[]>(TEAM_CATEGORIES.map((c) => [c.key, []]));
  const extras = new Map<string, TeamMember[]>();

  for (const m of members) {
    const key = (m.category || "").trim().toLowerCase();
    if (key && known.has(key)) {
      known.get(key)!.push(m);
    } else if (key) {
      const list = extras.get(key) ?? [];
      list.push(m);
      extras.set(key, list);
    } else {
      known.get("permanent")!.push(m);
    }
  }

  const groups: { meta: TeamCategoryMeta; members: TeamMember[] }[] = [];
  for (const meta of TEAM_CATEGORIES) {
    const list = known.get(meta.key) ?? [];
    if (list.length > 0) groups.push({ meta, members: list });
  }
  for (const [key, list] of extras) {
    if (list.length === 0) continue;
    const title = key.charAt(0).toUpperCase() + key.slice(1);
    groups.push({ meta: { key, title, description: "Part of the wider Mistravora team." }, members: list });
  }
  return groups;
}

export function parseExpertise(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

// Only treat values that start with http(s) as safe external links. Anything
// else (e.g. a bare handle) is dropped rather than risk a broken or unsafe
// navigation. Email is handled separately via mailto.
export function safeUrl(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v === "") return null;
  try { const url = new URL(v); if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href; } catch {}
  return null;
}

export function safeMailto(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v === "") return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${encodeURIComponent(v)}`;
  return null;
}

export function memberInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function categoryLabel(category: string | null | undefined): string {
  const key = (category || "").trim().toLowerCase();
  const found = TEAM_CATEGORIES.find((c) => c.key === key);
  if (found) return found.title;
  if (!key) return "Team";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function buildSocialLinks(member: TeamMember, companyName: string): SocialLink[] {
  const links: SocialLink[] = [];
  const linkedin = safeUrl(member.linkedin);
  if (linkedin) links.push({ href: linkedin, label: `${member.name} on LinkedIn`, platform: "LinkedIn", icon: <LinkedinIcon size={16} aria-hidden />, external: true });
  const x = safeUrl(member.x_handle);
  if (x) links.push({ href: x, label: `${member.name} on X`, platform: "X", icon: <XIcon size={14} aria-hidden />, external: true });
  const github = safeUrl(member.github);
  if (github) links.push({ href: github, label: `${member.name} on GitHub`, platform: "GitHub", icon: <GithubIcon size={16} aria-hidden />, external: true });
  const instagram = safeUrl(member.instagram);
  if (instagram) links.push({ href: instagram, label: `${member.name} on Instagram`, platform: "Instagram", icon: <InstagramIcon size={16} aria-hidden />, external: true });
  const facebook = safeUrl(member.facebook);
  if (facebook) links.push({ href: facebook, label: `${member.name} on Facebook`, platform: "Facebook", icon: <FacebookIcon size={16} aria-hidden />, external: true });
  const website = safeUrl(member.website);
  if (website) links.push({ href: website, label: `${member.name} personal website`, platform: "Website", icon: <Globe aria-hidden className="h-4 w-4" />, external: true });
  const mailto = safeMailto(member.email);
  if (mailto) links.push({ href: mailto, label: `Email ${member.name} at ${companyName}`, platform: "Email", icon: <Mail aria-hidden className="h-4 w-4" />, external: false });
  return links;
}
