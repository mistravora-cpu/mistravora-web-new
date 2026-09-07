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
  { name: "published", label: "Published" },
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
  { name: "body", label: "Project content (HTML, internal CSS, images and proof links)", type: "textarea", placeholder: '<style>.project-proof { padding: 1rem; }</style>\n<h2>Project details</h2>\n<p>Describe the work and supporting evidence.</p>\n<section class="project-proof"><h2>Proof and references</h2><ul><li><a href="https://example.com/evidence">View supporting evidence</a></li></ul></section>' },
  { name: "sort_order", label: "Display Order", type: "number" },
  { name: "published", label: "Published", type: "boolean" },
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
