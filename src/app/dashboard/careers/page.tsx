import type { Metadata } from "next";
import { getAdminJobs as getJobs, getAdminBenefits as getBenefits } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Careers Management",
  robots: { index: false, follow: false },
};

const jobColumns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "type", label: "Type" },
  { name: "location", label: "Location" },
  { name: "published", label: "Active" },
];

const jobFields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "location", label: "Location", placeholder: "Colombo, Sri Lanka" },
  { name: "type", label: "Type", placeholder: "Full-time / Part-time / Contract" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "published", label: "Active", type: "boolean" },
];

const benefitColumns: ColumnDef[] = [
  { name: "icon", label: "Icon" },
  { name: "title", label: "Title" },
  { name: "published", label: "Active" },
];

const benefitFields: FieldDef[] = [
  { name: "icon", label: "Icon", type: "icon", required: true },
  { name: "title", label: "Title", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function CareersAdminPage() {
  const [jobs, benefits] = await Promise.all([getJobs(), getBenefits()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Careers Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage job positions, benefits, and page content.
        </p>
      </div>

      <CrudManager
        table="jobs"
        title="Job Positions"
        columns={jobColumns}
        fields={jobFields}
        rows={jobs as unknown as Record<string, unknown>[]}
      />

      <CrudManager
        table="benefits"
        title="Company Benefits"
        columns={benefitColumns}
        fields={benefitFields}
        rows={benefits as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
