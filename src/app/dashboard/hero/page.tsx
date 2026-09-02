import type { Metadata } from "next";
import { getAdminHeroSections as getAllHeroSections } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Hero Sections",
  robots: { index: false, follow: false },
};

const heroColumns: ColumnDef[] = [
  { name: "page", label: "Page" },
  { name: "headline", label: "Headline" },
  { name: "primary_button_text", label: "Primary CTA" },
];

const heroFields: FieldDef[] = [
  {
    name: "page",
    label: "Page",
    required: true,
    placeholder: "home / about / solutions / pricing / etc.",
  },
  { name: "badge", label: "Badge", placeholder: "Small text above headline" },
  { name: "headline", label: "Headline", required: true },
  { name: "highlighted_text", label: "Highlighted Text", placeholder: "Words to accent in gradient" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "primary_button_text", label: "Primary Button Text", placeholder: "Get in touch" },
  { name: "primary_button_link", label: "Primary Button Link", placeholder: "/contact or https://..." },
  { name: "secondary_button_text", label: "Secondary Button Text" },
  { name: "secondary_button_link", label: "Secondary Button Link" },
];

export default async function HeroAdminPage() {
  const heroes = await getAllHeroSections();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Hero Sections</h1>
        <p className="text-sm text-muted-foreground">
          Manage the hero banner content for each page. The home page and
          all other pages use the standard animated hero.
        </p>
      </div>

      <CrudManager
        table="hero_sections"
        title="Page Heroes"
        columns={heroColumns}
        fields={heroFields}
        rows={heroes as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
