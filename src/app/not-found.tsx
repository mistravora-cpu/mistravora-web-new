import Link from "next/link";
import { ArrowLeft, Compass, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute left-[8%] top-[15%] h-40 w-40 animate-float rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute right-[10%] top-[30%] h-56 w-56 animate-float rounded-full bg-brand-blue/20 blur-3xl [animation-delay:1.2s]"
      />
      <div
        aria-hidden
        className="absolute bottom-[15%] left-[30%] h-32 w-32 animate-float rounded-full bg-primary/15 blur-3xl [animation-delay:2.1s]"
      />

      <div className="relative animate-fade-in-up">
        <p className="text-gradient animate-gradient text-8xl font-black leading-none tracking-tighter sm:text-9xl">
          404
        </p>
      </div>

      <span className="relative inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground [animation-delay:120ms]">
        <Compass aria-hidden className="h-3.5 w-3.5 animate-float text-primary" />
        You&apos;ve drifted off the map
      </span>

      <h1 className="relative max-w-md animate-fade-in-up text-2xl font-bold tracking-tight [animation-delay:220ms] sm:text-3xl">
        This page doesn&apos;t exist — but your next project could
      </h1>

      <p className="relative max-w-md animate-fade-in-up text-sm leading-6 text-muted-foreground [animation-delay:320ms] sm:text-base">
        The link may be broken or the page was moved. Let&apos;s get you back
        to something useful.
      </p>

      <div className="relative flex w-full animate-fade-in-up flex-col gap-3 [animation-delay:420ms] sm:w-auto sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            Ask us instead
          </a>
        </Button>
      </div>
    </div>
  );
}

