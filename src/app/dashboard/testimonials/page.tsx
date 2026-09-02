import type { Metadata } from "next";
import { getAdminTestimonials as getTestimonials } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Testimonials",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
  { name: "rating", label: "Rating" },
  { name: "published", label: "Active" },
];

const fields: FieldDef[] = [
  { name: "quote", label: "Quote", type: "textarea", required: true },
  { name: "name", label: "Name", required: true },
  { name: "role", label: "Role", required: true, placeholder: "CEO — Company" },
  { name: "avatar", label: "Avatar Image", type: "image" },
  { name: "rating", label: "Rating (1-5)", type: "number" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function TestimonialsAdminPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <p className="text-sm text-muted-foreground">
          Client reviews displayed in the animated marquee on the home page.
        </p>
      </div>
      <CrudManager
        table="testimonials"
        columns={columns}
        fields={fields}
        rows={testimonials as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
