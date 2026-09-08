"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { HeroMediaConfig } from "@/lib/hero-media-config";
const Context = createContext<HeroMediaConfig>({});
export const HeroMediaProvider = Context.Provider;
const integratedPages = new Set(["/", "/about", "/solutions", "/pricing", "/blog", "/projects", "/careers", "/contact", "/industries", "/research", "/tools"]);
export function HeroMedia({page, fallback = false}: {page?: string; fallback?: boolean}) {
  const path = usePathname().replace(/\/$/, "") || "/";
  const config = useContext(Context);
  const key = page ?? path;
  const items = config[key];
  if (fallback && integratedPages.has(path)) return null;
  if (!items?.length) return null;
  return <MediaPlayer key={key + JSON.stringify(items)} items={items} />;
}
function MediaPlayer({items}: {items: HeroMediaConfig[string]}) {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const item = items[index];
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => { setReduced(motion.matches); setRunning(visible && !document.hidden && !motion.matches); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", update); motion.addEventListener("change", update); update();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); motion.removeEventListener("change", update); };
  }, []);
  useEffect(() => {
    if (!running || items.length < 2 || item.type === "video") return;
    const timer = setTimeout(() => setIndex(i => (i + 1) % items.length), 5500);
    return () => clearTimeout(timer);
  }, [running, index, items.length, item.type]);
  useEffect(() => {
    if (!video.current) return;
    if (running) void video.current.play().catch(() => { /* Native controls remain available when autoplay is blocked. */ });
    else video.current.pause();
  }, [running, index]);
  return <div ref={root} className="relative mx-auto w-full overflow-hidden bg-muted aspect-[4/3] sm:aspect-[16/7]" role="region" aria-label="Page hero media">
    {item.type === "image" ? (
      // Direct CMS links and already-optimized R2 uploads need no proxy.
      // eslint-disable-next-line @next/next/no-img-element
      <img key={item.url} src={item.url} alt={item.alt} decoding="async" className="h-full w-full object-contain motion-safe:animate-hero-media-in" />
    ) : <video key={item.url} ref={video} src={item.url} aria-label={item.alt} muted playsInline controls preload="none" loop={items.length === 1} onEnded={() => {if (running) setIndex(i => (i + 1) % items.length);}} className="h-full w-full object-contain" />}
    {items.length > 1 && <div className="absolute top-3 left-1/2 flex max-w-full -translate-x-1/2 flex-wrap justify-center gap-1 rounded-2xl bg-background/90 px-2 py-2">
      {items.map((slide, i) => <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Show ${slide.type} ${i+1}: ${slide.alt}`} aria-current={index === i ? "true" : undefined} className={`h-5 w-5 rounded-full border border-foreground/40 ${index === i ? "bg-primary" : "bg-background"}`} />)}
    </div>}
    {reduced && <span className="sr-only">Automatic rotation follows your reduced-motion preference.</span>}
  </div>;
}
