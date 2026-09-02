import type { Metadata } from "next";
import { getAdminTechStack as getTechStack } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Tech Stack",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "category", label: "Category" },
  { name: "sort_order", label: "Order" },
  { name: "published", label: "Active" },
];

const fields: FieldDef[] = [
  { name: "name", label: "Technology Name", required: true, placeholder: "React" },
  { name: "category", label: "Category", placeholder: "Frontend, Backend, Database, DevOps" },
  { name: "logo", label: "Logo Image", type: "image" },
  { name: "sort_order", label: "Display Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function TechStackAdminPage() {
  const techStack = await getTechStack();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tech Stack</h1>
        <p className="text-sm text-muted-foreground">
          Manage the technologies displayed in the tech stack section. Upload logos or use CDN URLs.
        </p>
      </div>
      <CrudManager
        table="tech_stack"
        columns={columns}
        fields={fields}
        rows={techStack as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
