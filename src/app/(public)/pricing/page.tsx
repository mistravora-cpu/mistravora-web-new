import { ArticleBody } from "@/components/article-body";
import Link from "next/link";
import { getHeroSection, getPricingTiers, getPricingNotes, getPricingAddons } from "@/lib/services";
import { AnimatedHero } from "@/components/animated-hero";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { site } from "@/lib/site";
export async function generateMetadata() { return applySeoOverrides({title:"Project pricing",alternates:{canonical:`${site.url}/pricing`}}); }
export default async function PricingPage() {
  const [hero, tiers, notes, addons] = await Promise.all([getHeroSection("pricing"), getPricingTiers(true), getPricingNotes(true), getPricingAddons(true)]);
  return <><AnimatedHero hero={hero} page="pricing" /><section className="w-full site-gutter section-py">
    <h2 className="text-3xl font-bold tracking-tight">Project packages</h2>
    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{tiers.map(tier=><article key={tier.id} className={`relative rounded-xl border p-7 transition-shadow ${tier.popular ? "border-primary/30 bg-card shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--primary)_18%,transparent)]" : "border-border bg-card"}`}>
      {tier.popular && <p className="absolute -top-3 left-7 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Featured package</p>}
      <h3 className="text-xl font-semibold tracking-tight">{tier.name}</h3>
      {tier.tagline && <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>}
      <p className="mt-5 text-3xl font-bold tracking-tight">{tier.price}</p>
      {tier.description && <div className="mt-3 text-sm leading-6 text-muted-foreground"><ArticleBody body={tier.description ?? ""} title="Package details" /></div>}
      <ul className="mt-6 flex flex-col gap-2.5">{tier.features.map((feature,i)=><li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />{feature}</li>)}</ul>
      <Link href="/contact" className="mt-7 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">{tier.button_text || "Request a quotation"}</Link>
    </article>)}</div>
    {!tiers.length && <p className="mt-10 text-muted-foreground">Contact us for a quotation tailored to your requirements.</p>}
    {!!notes.length && <ul className="mt-12 space-y-3">{notes.map(note=><li key={note.id} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" aria-hidden /><ArticleBody body={note.text} title="Pricing note" /></li>)}</ul>}
    {!!addons.length && <div className="mt-12"><h2 className="text-xl font-semibold tracking-tight">Available add-ons</h2><ul className="mt-5 flex flex-wrap gap-2">{addons.map(addon=><li key={addon.id} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground/85">{addon.name}</li>)}</ul></div>}
    <p className="mt-12 text-sm text-muted-foreground">Final scope, price and payment terms are confirmed in your written quotation.</p>
    <nav className="mt-6 flex flex-wrap gap-6" aria-label="Pricing tools and policies"><Link href="/tools/cost-calculator" className="text-sm font-medium text-primary link-underline">Estimate your project</Link><Link href="/policies/refund-policy" className="text-sm font-medium text-primary link-underline">Refund policy</Link></nav>
  </section></>;
}
