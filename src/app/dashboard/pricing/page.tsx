import type { Metadata } from "next";
import { getAdminPricingTiers as getPricingTiers, getAdminPricingNotes as getPricingNotes, getAdminPricingAddons as getPricingAddons } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Pricing Management",
  robots: { index: false, follow: false },
};

const tierColumns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "price", label: "Price" },
  { name: "popular", label: "Popular" },
  { name: "active", label: "Active" },
];

const tierFields: FieldDef[] = [
  { name: "name", label: "Tier Name", required: true },
  { name: "icon", label: "Icon", type: "icon" },
  { name: "tagline", label: "Tagline" },
  { name: "price", label: "Price", placeholder: "LKR 150k+" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "features", label: "Features (one per line)", type: "list" },
  { name: "button_text", label: "Button Text", placeholder: "Get Started" },
  { name: "sort_order", label: "Display Order", type: "number" },
  { name: "popular", label: "Highlighted (Popular)", type: "boolean" },
  { name: "active", label: "Active", type: "boolean" },
];

const noteColumns: ColumnDef[] = [
  { name: "text", label: "Text" },
  { name: "active", label: "Active" },
];

const noteFields: FieldDef[] = [
  { name: "text", label: "Text", required: true, type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "active", label: "Active", type: "boolean" },
];

const addonColumns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "active", label: "Active" },
];

const addonFields: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "active", label: "Active", type: "boolean" },
];

export default async function PricingAdminPage() {
  const [tiers, notes, addons] = await Promise.all([
    getPricingTiers(),
    getPricingNotes(),
    getPricingAddons(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Pricing Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage pricing tiers, notes, and available add-ons.
        </p>
      </div>

      <CrudManager
        table="pricing_tiers"
        title="Pricing Tiers"
        columns={tierColumns}
        fields={tierFields}
        rows={tiers as unknown as Record<string, unknown>[]}
      />

      <CrudManager
        table="pricing_notes"
        title="Pricing Notes"
        columns={noteColumns}
        fields={noteFields}
        rows={notes as unknown as Record<string, unknown>[]}
      />

      <CrudManager
        table="pricing_addons"
        title="Available Add-ons"
        columns={addonColumns}
        fields={addonFields}
        rows={addons as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
