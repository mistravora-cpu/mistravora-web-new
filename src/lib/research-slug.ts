/** Accept a slug or pasted research URL, and store one safe path segment. */
export function normalizeResearchSlug(input: string): string | null {
  let value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    try { value = new URL(value).pathname; } catch { return null; }
  }
  value = value.replace(/^\/+|\/+$/g, "").replace(/^research\//i, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value)) return null;
  return value.toLowerCase();
}
