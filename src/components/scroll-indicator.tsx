"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY < 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-foreground/40 transition-opacity"
    >
      <span className="text-[10px] font-medium uppercase tracking-widest">Scroll</span>
      <div className="flex h-8 w-5 justify-center rounded-full border border-foreground/20">
        <span className="mt-1.5 h-1.5 w-1 animate-scroll-down rounded-full bg-primary" />
      </div>
      <ChevronDown className="h-3 w-3 animate-bounce-soft" />
    </div>
  );
}
