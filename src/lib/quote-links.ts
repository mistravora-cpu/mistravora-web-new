/** One public destination for requirement gathering and quotations. */
export const estimatePath = "/pricing#estimate";

export function quoteLink(context?: string) {
  const interest = context?.trim().slice(0, 120);
  return interest
    ? `/pricing?service=${encodeURIComponent(interest)}#estimate`
    : estimatePath;
}

/** Keep CMS contact/support links intact; migrate old quotation destinations. */
export function resolveQuoteLink(href: string, label: string) {
  try {
    const url = new URL(href, "https://www.mistravora.com");
    if (
      !["www.mistravora.com", "mistravora.com"].includes(url.hostname) ||
      !["https:", "http:"].includes(url.protocol)
    )
      return href;
    const path = url.pathname.replace(/\/+$/, "");
    if (
      path === "/tools/cost-calculator" ||
      (path === "/contact" &&
        /\b(quot(?:e|ation)|estimat\w*|pric\w*|get started|start (?:your |a |the )?project)\b/i.test(
          label,
        ))
    ) {
      return quoteLink(url.searchParams.get("service") ?? undefined);
    }
  } catch {
    /* Preserve a CMS value that is not a URL. */
  }
  return href;
}
