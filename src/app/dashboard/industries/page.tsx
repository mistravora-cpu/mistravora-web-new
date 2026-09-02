import type { Metadata } from "next";
import { getAdminIndustries as getIndustries } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Industries Management",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug" },
  { name: "archived", label: "Archived" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", required: true, placeholder: "retail" },
  { name: "icon", label: "Icon", type: "icon" },
  { name: "summary", label: "Short Description", type: "textarea" },
  { name: "description", label: "Long Description", type: "textarea" },
  { name: "image", label: "Industry Image", type: "image" },
  { name: "challenges", label: "Industry Challenges (one per line)", type: "list" },
  { name: "solutions", label: "Industry Solutions (one per line)", type: "list" },
  { name: "sort_order", label: "Display Order", type: "number" },
  { name: "archived", label: "Archived", type: "boolean" },
];

export default async function IndustriesAdminPage() {
  const industries = await getIndustries();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Industries</h1>
        <p className="text-sm text-muted-foreground">
          Manage industry pages with challenges and solutions.
        </p>
      </div>
      <CrudManager
        table="industries"
        columns={columns}
        fields={fields}
        rows={industries as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
