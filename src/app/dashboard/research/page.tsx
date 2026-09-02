import type { Metadata } from "next";
import { Microscope } from "lucide-react";
import { getResearch } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Research Management",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "category", label: "Category" },
  { name: "author", label: "Author" },
  { name: "published", label: "Published" },
  { name: "published_at", label: "Date" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", required: true, placeholder: "my-research" },
  { name: "summary", label: "Summary", type: "textarea", required: true },
  { name: "body", label: "Body (HTML)", type: "textarea" },
  { name: "category", label: "Category", placeholder: "Performance / AI / Security" },
  { name: "tags", label: "Tags", type: "list", placeholder: "web-performance, seo, nextjs" },
  { name: "cover_image", label: "Cover Image", type: "image" },
  { name: "author", label: "Author" },
  { name: "published_at", label: "Published Date", placeholder: "2025-01-15" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Published", type: "boolean" },
];

export default async function ResearchAdminPage() {
  const research = await getResearch();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Research</h1>
        <p className="text-sm text-muted-foreground">
          Publish original research, analysis, and studies.
        </p>
      </div>

      {research.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Microscope className="h-6 w-6 text-primary" />
          </span>
          <h2 className="text-lg font-semibold">No research published yet</h2>
          <p className="text-sm text-muted-foreground">
            Use the form below to add your first research article.
          </p>
        </div>
      ) : null}

      <CrudManager
        table="research"
        columns={columns}
        fields={fields}
        rows={research as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
