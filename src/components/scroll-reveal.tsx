"use client";

import * as React from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  animation?:
    | "fade-up"
    | "slide-left"
    | "slide-right"
    | "scale-in"
    | "blur-in"
    | "flip-in"
    | "elastic"
    | "rotate-in"
    | "clip-reveal";
  delay?: number;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
};

const animationClassMap: Record<NonNullable<ScrollRevealProps["animation"]>, string> = {
  "fade-up": "animate-fade-in-up",
  "slide-left": "animate-slide-left",
  "slide-right": "animate-slide-right",
  "scale-in": "animate-scale-in",
  "blur-in": "animate-blur-in",
  "flip-in": "animate-flip-in",
  "elastic": "animate-elastic",
  "rotate-in": "animate-rotate-in",
  "clip-reveal": "animate-clip-reveal",
};

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as unknown as React.FC<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;

  return (
    <Component
      ref={ref}
      className={`${className} ${visible ? animationClassMap[animation] : "opacity-0"}`}
      style={{ animationDelay: delay ? `${delay}ms` : undefined, contain: "layout style" }}
    >
      {children}
    </Component>
  );
}
