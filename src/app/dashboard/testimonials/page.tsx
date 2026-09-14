import type { Metadata } from "next";
import { getAdminTestimonials as getTestimonials } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Customer reviews",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
  { name: "rating", label: "Rating" },
  { name: "published", label: "Published" },
];

const fields: FieldDef[] = [
  { name: "quote", label: "Quote", type: "textarea", required: true },
  { name: "name", label: "Name", required: true },
  {
    name: "role",
    label: "Role / company (optional)",
    placeholder: "Only attribution approved by the customer",
  },
  {
    name: "avatar",
    label: "Approved reviewer photo (optional)",
    type: "image",
  },
  {
    name: "rating",
    label: "Actual rating (1–5); 0 or blank if not supplied",
    type: "number",
  },
  {
    name: "source_name",
    label: "Review source",
    placeholder: "Google, Facebook, email, or direct feedback",
  },
  {
    name: "source_url",
    label: "Public link to original review (optional)",
    placeholder: "https://… (never a private inbox or customer record)",
  },
  {
    name: "review_date",
    label: "Original review date (optional)",
    placeholder: "YYYY-MM-DD",
  },
  {
    name: "display_paths",
    label: "Display pages — one path per line",
    type: "list",
    placeholder:
      "/\n/about\n/pricing\n/projects/shopmate\n/services/websites-and-web-applications",
  },
  {
    name: "permission_confirmed",
    label:
      "I confirm this is real customer feedback and we have permission to publish the quote, attribution and photo",
    type: "boolean",
  },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Published", type: "boolean" },
];

export default async function TestimonialsAdminPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Customer reviews</h1>
        <p className="text-sm text-muted-foreground">
          Manually add genuine feedback from any platform. Keep the original
          meaning and only enter the public name, role and photo the customer
          approved. A rating is optional; never infer five stars.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Confirm permission and turn on Published to display a review. Use / for
        the homepage, /about, /pricing, /contact, or a specific /services/slug,
        /solutions/slug, /projects/slug or /industries/slug. With no paths
        entered on creation, reviews appear on Home, About and Pricing. Existing
        sample reviews remain unpublished until reviewed.
      </p>
      <CrudManager
        table="testimonials"
        columns={columns}
        fields={fields}
        rows={testimonials as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
