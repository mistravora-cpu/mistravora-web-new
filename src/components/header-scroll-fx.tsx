"use client";

import * as React from "react";

export function HeaderScrollFx() {
  React.useEffect(() => {
    const onScroll = () => {
      document.documentElement.classList.toggle(
        "scrolled",
        window.scrollY > 24
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
