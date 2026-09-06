import { createElement, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
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
const animationClassMap = {
  "fade-up": "animate-fade-in-up",
  "slide-left": "animate-slide-left",
  "slide-right": "animate-slide-right",
  "scale-in": "animate-scale-in",
  "blur-in": "animate-blur-in",
  "flip-in": "animate-flip-in",
  elastic: "animate-elastic",
  "rotate-in": "animate-rotate-in",
  "clip-reveal": "animate-clip-reveal",
};
/** Server-render the content; one shared observer enhances all reveal elements. */
export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
  as = "div",
}: ScrollRevealProps) {
  return createElement(
    as,
    {
      className,
      "data-reveal": animationClassMap[animation],
      style: {
        animationDelay: delay ? `${delay}ms` : undefined,
        contain: "layout style",
      },
    },
    children,
  );
}
