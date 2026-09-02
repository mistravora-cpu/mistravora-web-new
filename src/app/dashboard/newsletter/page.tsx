import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getNewsletterSubscribers } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Newsletter Subscribers",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "email", label: "Email" },
  { name: "status", label: "Status" },
  { name: "created_at", label: "Subscribed On" },
];

const fields: FieldDef[] = [
  { name: "email", label: "Email", required: true },
  { name: "status", label: "Status", required: true, type: "text" },
  { name: "source", label: "Source", type: "text" },
];

export default async function NewsletterAdminPage() {
  const subscribers = await getNewsletterSubscribers();
  const activeCount = subscribers.filter((s) => s.status === "active").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
        <p className="text-sm text-muted-foreground">
          {subscribers.length} total · {activeCount} active
        </p>
      </div>

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </span>
          <h2 className="text-lg font-semibold">No subscribers yet</h2>
          <p className="text-sm text-muted-foreground">
            Newsletter signups from the website will appear here.
          </p>
        </div>
      ) : (
        <CrudManager
          table="newsletter_subscribers"
          columns={columns}
          fields={fields}
          rows={subscribers as unknown as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}
