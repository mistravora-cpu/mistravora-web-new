import type { Metadata } from "next";
import Link from "next/link";
import {
  getAdminCaseStudies as getCaseStudies,
  getInquiries,
  getAdminJobs as getJobs,
  getAdminPosts as getPosts,
  getAdminSolutions as getSolutions,
  getAdminValueCards as getValueCards,
  getAdminStatistics as getStatistics,
  getAdminTrustedCompanies as getTrustedCompanies,
} from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "./crud-manager";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const valueColumns: ColumnDef[] = [
  { name: "icon", label: "Icon" },
  { name: "title", label: "Title" },
  { name: "published", label: "Active" },
];

const valueFields: FieldDef[] = [
  { name: "icon", label: "Icon", type: "icon", required: true },
  { name: "title", label: "Title", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

const statColumns: ColumnDef[] = [
  { name: "value", label: "Value" },
  { name: "label", label: "Label" },
  { name: "published", label: "Active" },
];

const statFields: FieldDef[] = [
  { name: "value", label: "Value", required: true, placeholder: "500+" },
  { name: "label", label: "Label", required: true, placeholder: "Projects Delivered" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function DashboardPage() {
  const [solutions, caseStudies, posts, inquiries, jobs, valueCards, stats, companies] =
    await Promise.all([
      getSolutions(),
      getCaseStudies(),
      getPosts(),
      getInquiries(),
      getJobs(),
      getValueCards(),
      getStatistics(),
      getTrustedCompanies(),
    ]);

  const statsData = [
    { label: "Solutions", count: solutions.length, href: "/dashboard/solutions", desc: "Services & offerings" },
    { label: "Case Studies", count: caseStudies.length, href: "/dashboard/case-studies", desc: "Client success stories" },
    { label: "Blog Posts", count: posts.length, href: "/dashboard/blog", desc: "Articles & insights" },
    { label: "Inquiries", count: inquiries.length, href: "/dashboard/inquiries", desc: "Contact form submissions" },
    { label: "Job Openings", count: jobs.length, href: "/dashboard/careers", desc: "Active career posts" },
    { label: "Trusted Companies", count: companies.length, href: "/dashboard/trusted-companies", desc: "Client logos & partners" },
    { label: "Value Cards", count: valueCards.length, href: "/dashboard", desc: "Homepage value props" },
    { label: "Statistics", count: stats.length, href: "/dashboard", desc: "Homepage metrics" },
  ];

  const quickActions = [
    { label: "Add Solution", href: "/dashboard/solutions", desc: "Create a new service offering" },
    { label: "Write Blog Post", href: "/dashboard/blog", desc: "Publish a new article" },
    { label: "Add Case Study", href: "/dashboard/case-studies", desc: "Showcase client results" },
    { label: "Upload Media", href: "/dashboard/media", desc: "Upload images to R2 CDN" },
    { label: "Manage Pricing", href: "/dashboard/pricing", desc: "Update pricing tiers" },
    { label: "View Inquiries", href: "/dashboard/inquiries", desc: "Check new leads" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your website content, track performance, and keep everything up to date.
        </p>
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Content Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <p className="text-3xl font-bold text-primary">{stat.count}</p>
              <p className="mt-1 text-sm font-medium">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium group-hover:text-primary">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <CrudManager
        table="value_cards"
        title="Value Cards"
        columns={valueColumns}
        fields={valueFields}
        rows={valueCards as unknown as Record<string, unknown>[]}
      />

      <CrudManager
        table="statistics"
        title="Statistics"
        columns={statColumns}
        fields={statFields}
        rows={stats as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
