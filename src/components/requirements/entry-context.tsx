"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Isolate URL-dependent hydration so the calculator itself stays server rendered. */
export function RequirementEntryContext({
  onChange,
}: {
  onChange: (context: string) => void;
}) {
  const params = useSearchParams();
  const context = params.get("service")?.trim().slice(0, 120) ?? "";
  useEffect(() => {
    if (context) onChange(context);
    const frame = requestAnimationFrame(() => {
      if (window.location.hash === "#estimate") {
        document
          .getElementById("estimate")
          ?.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [context, onChange]);
  return null;
}
