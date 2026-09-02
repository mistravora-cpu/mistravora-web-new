import type { Metadata } from "next";
import { getAdminCoreValues as getCoreValues, getAdminTeamMembers as getTeamMembers } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "About Management",
  robots: { index: false, follow: false },
};

const valueColumns: ColumnDef[] = [
  { name: "icon", label: "Icon" },
  { name: "title", label: "Title" },
  { name: "published", label: "Active" },
];

const valueFields: FieldDef[] = [
  { name: "icon", label: "Icon", type: "icon", required: true },
  { name: "title", label: "Title", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

const teamColumns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
  { name: "published", label: "Active" },
];

const teamFields: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "role", label: "Role", required: true },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "photo", label: "Profile Image", type: "image" },
  { name: "linkedin", label: "LinkedIn Profile" },
  { name: "x_handle", label: "X Profile (Twitter)", placeholder: "https://x.com/..." },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function AboutAdminPage() {
  const [values, team] = await Promise.all([getCoreValues(), getTeamMembers()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">About Page Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage core values and team members.
        </p>
      </div>

      <CrudManager
        table="core_values"
        title="Core Values"
        columns={valueColumns}
        fields={valueFields}
        rows={values as unknown as Record<string, unknown>[]}
      />

      <CrudManager
        table="team_members"
        title="Team Members"
        columns={teamColumns}
        fields={teamFields}
        rows={team as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
