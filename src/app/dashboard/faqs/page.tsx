import type { Metadata } from "next";
import { getAdminFaqs } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";
export const metadata: Metadata = {
  title: "Questions & answers",
  robots: { index: false, follow: false },
};
const columns: ColumnDef[] = [
  { name: "question", label: "Question" },
  { name: "page", label: "Page" },
  { name: "published", label: "Published" },
];
const fields: FieldDef[] = [
  {
    name: "page",
    label: "Page",
    required: true,
    placeholder:
      "general, home, contact, pricing, services, or services/your-slug",
  },
  { name: "question", label: "Customer question", required: true },
  { name: "answer", label: "Answer", type: "richtext", required: true },
  { name: "sort_order", label: "Sort order", type: "number" },
  { name: "published", label: "Published", type: "boolean" },
];
export default async function FaqAdminPage() {
  const rows = await getAdminFaqs();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Questions &amp; answers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          General answers appear on Home and Contact. Target another page using
          its path without a leading slash: about, pricing, careers, services,
          solutions, projects, industries, or a service, solution, project or
          industry detail path. Keep answers specific, accurate and useful to
          customers.
        </p>
      </div>
      <CrudManager
        table="faqs"
        columns={columns}
        fields={fields}
        rows={rows as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
