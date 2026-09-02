import type { Metadata } from "next";
import { getAdminSolutions as getSolutions } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Solutions",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "category", label: "Category" },
  { name: "icon", label: "Icon" },
  { name: "sort_order", label: "Order" },
  { name: "published", label: "Active" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", required: true, placeholder: "my-solution" },
  { name: "icon", label: "Icon", type: "icon", placeholder: "Lucide icon name" },
  { name: "category", label: "Category", placeholder: "Web Development" },
  { name: "short_description", label: "Short Description", type: "textarea", placeholder: "Professional websites that convert visitors into customers" },
  { name: "long_description", label: "Long Description", type: "textarea" },
  { name: "image", label: "Solution Image", type: "image" },
  { name: "technologies", label: "Technologies (one per line)", type: "list", placeholder: "React, Next.js, Tailwind CSS" },
  { name: "features", label: "Features (one per line)", type: "list" },
  { name: "services", label: "Included Services (one per line)", type: "list" },
  { name: "process_steps", label: "Process Steps (one per line)", type: "list" },
  { name: "summary", label: "Summary (legacy)", type: "textarea" },
  { name: "body", label: "Body (legacy)", type: "textarea" },
  { name: "sort_order", label: "Display Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function SolutionsAdminPage() {
  const solutions = await getSolutions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Solutions</h1>
        <p className="text-sm text-muted-foreground">
          Manage services with icons, images, features, technologies, and pricing packages.
        </p>
      </div>
      <CrudManager
        table="solutions"
        columns={columns}
        fields={fields}
        rows={solutions as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
