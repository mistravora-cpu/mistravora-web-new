import type { Metadata } from "next";
import { getAdminDemoApps as getDemoApps } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Demo Apps",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "slug", label: "Slug" },
  { name: "industry", label: "Industry" },
  { name: "sort_order", label: "Order" },
  { name: "published", label: "Active" },
];

export default async function DemoAppsAdminPage() {
  const demoApps = await getDemoApps();

  const fields: FieldDef[] = [
    { name: "name", label: "App Name", required: true },
    { name: "slug", label: "Slug", required: true, placeholder: "bakery-pos" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "url", label: "Demo URL", placeholder: "https://demo.mistravora.com/..." },
    { name: "image", label: "Screenshot / Preview Image", type: "image" },
    { name: "screenshot", label: "Legacy Screenshot URL", type: "image" },
    { name: "industry", label: "Industry", placeholder: "Food & Beverage" },
    { name: "features", label: "Key Features (one per line)", type: "list", placeholder: "Live ordering, Inventory, Analytics" },
    { name: "sort_order", label: "Display Order", type: "number" },
    { name: "published", label: "Active", type: "boolean" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Demo Apps</h1>
        <p className="text-sm text-muted-foreground">
          Manage interactive demo applications with screenshots, features, and industry tags.
        </p>
      </div>
      <CrudManager
        table="demo_apps"
        columns={columns}
        fields={fields}
        rows={demoApps as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
