export function isR2MediaUrl(value: string, publicBase: string) {
  try {
    const url = new URL(value);
    const base = new URL(publicBase);
    const prefix = `${base.pathname.replace(/\/$/, "")}/uploads/`;
    return url.protocol === "https:" && url.origin === base.origin && !url.username && !url.password && url.pathname.startsWith(prefix) && !url.search && !url.hash;
  } catch { return false; }
}

export function isPublicMediaUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}
