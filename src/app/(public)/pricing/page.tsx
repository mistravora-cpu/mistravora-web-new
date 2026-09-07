import Link from "next/link";
import { getHeroSection, getPricingTiers, getPricingNotes, getPricingAddons } from "@/lib/services";
import { AnimatedHero } from "@/components/animated-hero";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { site } from "@/lib/site";
export async function generateMetadata() { return applySeoOverrides({title:"Project pricing",alternates:{canonical:`${site.url}/pricing`}}); }
export default async function PricingPage() {
  const [hero, tiers, notes, addons] = await Promise.all([getHeroSection("pricing"), getPricingTiers(true), getPricingNotes(true), getPricingAddons(true)]);
  return <><AnimatedHero hero={hero} page="pricing" /><section className="w-full site-gutter py-16">
    <h2 className="text-3xl font-bold">Project packages</h2>
    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{tiers.map(tier=><article key={tier.id} className="rounded-xl border border-border bg-card p-6">
      {tier.popular && <p className="text-sm text-primary">Featured package</p>}<h3 className="text-2xl font-semibold">{tier.name}</h3><p>{tier.tagline}</p><p className="my-4 text-3xl font-bold">{tier.price}</p><p className="text-muted-foreground">{tier.description}</p><ul className="my-5 list-inside list-disc space-y-2">{tier.features.map((feature,i)=><li key={i}>{feature}</li>)}</ul><Link href="/contact" className="inline-block rounded-lg bg-primary px-4 py-3 text-primary-foreground">{tier.button_text || "Request a quotation"}</Link>
    </article>)}</div>
    {!tiers.length && <p className="mt-6">Contact us for a quotation tailored to your requirements.</p>}
    {!!notes.length && <ul className="mt-8 list-inside list-disc space-y-3">{notes.map(note=><li key={note.id}>{note.text}</li>)}</ul>}
    {!!addons.length && <div className="mt-8"><h2 className="text-xl font-semibold">Available add-ons</h2><ul className="mt-3 list-inside list-disc">{addons.map(addon=><li key={addon.id}>{addon.name}</li>)}</ul></div>}
    <p className="mt-8 text-muted-foreground">Final scope, price and payment terms are confirmed in your written quotation.</p>
    <nav className="mt-6 flex flex-wrap gap-6" aria-label="Pricing tools and policies"><Link href="/tools/cost-calculator" className="underline">Estimate your project</Link><Link href="/policies/refund-policy" className="underline">Refund policy</Link></nav>
  </section></>;
}
