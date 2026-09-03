import type { Metadata } from "next";
import { getAdminCaseStudies as getCaseStudies } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Case Studies",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "client", label: "Client" },
  { name: "location", label: "Location" },
  { name: "date", label: "Date" },
  { name: "sort_order", label: "Order" },
  { name: "status", label: "Status" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", required: true, placeholder: "my-case-study" },
  { name: "client", label: "Client" },
  { name: "industry", label: "Industry" },
  { name: "location", label: "Location", placeholder: "Negombo, Sri Lanka" },
  { name: "date", label: "Date", placeholder: "2024" },
  { name: "cover_image", label: "Case Study Image", type: "image" },
  { name: "problem_statement", label: "Problem Statement", type: "textarea" },
  { name: "solution", label: "Solution", type: "textarea" },
  { name: "outcome", label: "Outcome", type: "textarea" },
  { name: "results", label: "Results (one per line)", type: "list", placeholder: "65% increase in online bookings" },
  { name: "technologies", label: "Technologies (one per line)", type: "list" },
  { name: "body", label: "Body (legacy)", type: "textarea" },
  { name: "sort_order", label: "Display Order", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["active", "draft", "archived"] },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function CaseStudiesAdminPage() {
  const caseStudies = await getCaseStudies();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Manage client projects with real, permission-backed metrics. Upload a cover image for each project to showcase on the website.
        </p>
      </div>
      <CrudManager
        table="case_studies"
        columns={columns}
        fields={fields}
        rows={caseStudies as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
