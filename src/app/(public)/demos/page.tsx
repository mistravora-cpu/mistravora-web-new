import { ArticleBody } from "@/components/article-body";
import { getDemoApps } from "@/lib/services";
import { ContentShell } from "@/components/content-page";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Demo applications", "Explore published Mistravora application demos.", "/demos");
export default async function DemosPage() {
 const demos = await getDemoApps(true);
 return <ContentShell title="Demo applications" description="Explore the published application previews."><div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{demos.map(demo=><article key={demo.id} className="rounded-xl border border-border p-6">
  {(demo.image || demo.screenshot) && (
   /* eslint-disable-next-line @next/next/no-img-element */
   <img src={demo.image || demo.screenshot || ""} alt={demo.name} loading="lazy" width={800} height={450} className="mb-4 aspect-video w-full rounded-lg object-cover" />
  )}<h2 className="text-xl font-semibold">{demo.name}</h2><p className="mt-2 text-muted-foreground">{demo.industry}</p><div className="mt-3"><ArticleBody body={demo.description ?? ""} title="Demo details" /></div><ul className="my-4 list-inside list-disc">{demo.features.map((feature,i)=><li key={i}>{feature}</li>)}</ul>{demo.url && /^https:\/\//.test(demo.url) && <a href={demo.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">Open {demo.name} demo (new tab)</a>}
 </article>)}</div>{!demos.length && <p className="mt-8">Demo previews are being prepared.</p>}</ContentShell>;
}
