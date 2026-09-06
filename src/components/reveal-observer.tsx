"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.dataset.reveal) el.classList.add(el.dataset.reveal);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    const observe = (root: Element) => {
      const elements = [
        ...(root.matches("[data-reveal]") ? [root] : []),
        ...root.querySelectorAll("[data-reveal]"),
      ];
      for (const el of elements)
        if (!seen.has(el)) {
          seen.add(el);
          observer.observe(el);
        }
    };
    observe(document.body);
    const mutations = new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes)
          if (node instanceof Element) observe(node);
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);
  return null;
}
