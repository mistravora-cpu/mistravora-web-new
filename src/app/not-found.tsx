import Link from "next/link";
import { ArrowRight, ArrowUpRight, Home, Search, Compass, Microscope, Layers, MessageCircle } from "lucide-react";

const destinations = [
  { href: "/services", title: "Find your solution", description: "Explore our digital services.", icon: Layers },
  { href: "/research", title: "Follow your curiosity", description: "Browse research and analysis.", icon: Microscope },
  { href: "/contact", title: "Talk to our team", description: "Let’s help you find the next step.", icon: MessageCircle },
];

export default function NotFound() {
  return (
    <section className="relative isolate flex flex-1 flex-col items-center overflow-hidden px-4 py-16 sm:px-8 sm:py-24" aria-labelledby="missing-title">
      <meta name="robots" content="noindex, follow" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_20%,rgba(0,153,255,0.12),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute top-12 -z-10 h-72 w-72 rounded-full border border-primary/15 sm:h-96 sm:w-96" />
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 text-xs font-medium tracking-widest text-primary">
          <Compass aria-hidden className="h-4 w-4" /> A SMALL DETOUR
        </span>
        <p aria-hidden className="mt-8 bg-gradient-to-b from-foreground to-primary/40 bg-clip-text text-[clamp(7rem,24vw,14rem)] font-black leading-none tracking-tighter text-transparent">404</p>
        <h1 id="missing-title" className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">This page is off the map.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">The page you’re looking for may have moved, or the link may be incomplete. There’s still plenty to discover.</p>
        <Link prefetch={false} href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <Home aria-hidden className="h-4 w-4" /> Back to home <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
        <form action="/search" method="get" role="search" className="mt-9 flex w-full max-w-lg items-center gap-2 rounded-xl border border-border bg-card p-2 focus-within:ring-2 focus-within:ring-primary">
          <Search aria-hidden className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <label className="sr-only" htmlFor="not-found-search">Search Mistravora</label>
          <input id="not-found-search" type="search" name="q" required maxLength={200} placeholder="Search services, articles and more" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
          <button type="submit" className="rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-primary">Search</button>
        </form>
      </div>
      <nav aria-label="Explore Mistravora" className="mt-12 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
        {destinations.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} prefetch={false} href={href} className="group rounded-2xl border border-border bg-card/80 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary">
            <div className="flex items-center justify-between"><Icon aria-hidden className="h-6 w-6 text-primary" /><ArrowUpRight aria-hidden className="h-4 w-4 text-muted-foreground group-hover:text-primary" /></div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </Link>
        ))}
      </nav>
    </section>
  );
}
