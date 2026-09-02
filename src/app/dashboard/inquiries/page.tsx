import type { Metadata } from "next";
import { getInquiries } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Inquiries",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email" },
  { name: "status", label: "Status" },
  { name: "created_at", label: "Date" },
];

const fields: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", required: true },
  { name: "phone", label: "Phone" },
  { name: "company", label: "Company" },
  { name: "message", label: "Message", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: ["new", "read", "replied"] },
];

export default async function InquiriesAdminPage() {
  const inquiries = await getInquiries();

  const newCount = inquiries.filter((i) => i.status === "new").length;
  const inProgressCount = inquiries.filter((i) => i.status === "read").length;
  const repliedCount = inquiries.filter((i) => i.status === "replied").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Inquiries</h1>
        <p className="text-sm text-muted-foreground">
          Messages submitted through the contact form.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-3xl font-bold text-primary">{newCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">New</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-3xl font-bold text-primary">{inProgressCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-3xl font-bold text-primary">{repliedCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">Replied</p>
        </div>
      </div>

      <CrudManager
        table="inquiries"
        columns={columns}
        fields={fields}
        rows={inquiries as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
