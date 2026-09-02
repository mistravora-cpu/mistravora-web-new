import type { Metadata } from "next";
import { getAdminPolicies as getPolicies } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Policies Management",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug" },
  { name: "version", label: "Version" },
  { name: "status", label: "Status" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", required: true, placeholder: "privacy-policy" },
  { name: "version", label: "Version", placeholder: "1.0" },
  { name: "status", label: "Status", type: "select", options: ["active", "draft", "archived"] },
  { name: "body", label: "Body", type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number" },
];

export default async function PoliciesAdminPage() {
  const policies = await getPolicies();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Policies</h1>
        <p className="text-sm text-muted-foreground">
          Manage legal policies and terms.
        </p>
      </div>
      <CrudManager
        table="policies"
        columns={columns}
        fields={fields}
        rows={policies as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
