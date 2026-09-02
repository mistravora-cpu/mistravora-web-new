import type { Metadata } from "next";
import { getAdminTrustedCompanies as getTrustedCompanies } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Trusted Companies",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "category", label: "Category" },
  { name: "website_url", label: "Website" },
  { name: "demo_url", label: "Demo Link" },
  { name: "featured", label: "Featured" },
  { name: "published", label: "Active" },
];

const fields: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "category", label: "Category" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "logo", label: "Logo Image", type: "image" },
  { name: "website_url", label: "Website URL", placeholder: "https://client-site.com" },
  { name: "demo_url", label: "Demo Link URL", placeholder: "https://demo.mistravora.com/client" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "featured", label: "Featured", type: "boolean" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function TrustedCompaniesAdminPage() {
  const companies = await getTrustedCompanies();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Trusted Companies</h1>
        <p className="text-sm text-muted-foreground">
          Manage companies that trust your services.
        </p>
      </div>
      <CrudManager
        table="trusted_companies"
        columns={columns}
        fields={fields}
        rows={companies as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
