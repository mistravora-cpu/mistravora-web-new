import type { Metadata } from "next";
import { getAdminResources as getResources } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Resources Management",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "category", label: "Category" },
  { name: "featured", label: "Featured" },
  { name: "published", label: "Active" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", required: true, placeholder: "my-resource" },
  { name: "category", label: "Category", placeholder: "Guides / White Papers / Webinars" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "icon", label: "Icon", type: "icon" },
  { name: "cover_image", label: "Cover Image", type: "image" },
  { name: "file_url", label: "File URL", type: "image" },
  { name: "downloads", label: "Downloads", type: "number" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "featured", label: "Featured", type: "boolean" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function ResourcesAdminPage() {
  const resources = await getResources();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-sm text-muted-foreground">
          Manage downloadable resources, guides, and white papers.
        </p>
      </div>
      <CrudManager
        table="resources"
        columns={columns}
        fields={fields}
        rows={resources as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
