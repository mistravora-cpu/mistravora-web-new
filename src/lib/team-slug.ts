/** Normalize a profile slug or pasted profile URL to one safe path segment. */
export function normalizeTeamSlug(input: string): string | null {
  let value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    try { value = new URL(value).pathname; } catch { return null; }
  }
  value = value.replace(/^\/+|\/+$/g, "").replace(/^about\/team\//i, "");
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value) ? value.toLowerCase() : null;
}
export function memberSlug(member: { id?: string; slug?: string | null; name: string }): string {
  return normalizeTeamSlug(member.slug || "") || member.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") || member.id || "team-member";
}
