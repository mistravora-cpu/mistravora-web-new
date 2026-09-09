import { getRequirementConfig } from "@/lib/requirements/settings";
import { RequirementConfigEditor } from "@/components/requirements/config-editor";
import { getQuoteRecipients } from "@/lib/requirements/notification-settings";
import { quotationEmailConfigured } from "@/lib/requirements/email";
import Link from "next/link";
export default async function CalculatorAdminPage() {
  const [config, recipients] = await Promise.all([
    getRequirementConfig(),
    getQuoteRecipients(),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Requirement gathering and estimation
      </h1>
      <p>
        Edit every project type, question, option, feature price, dependency,
        complexity threshold, scale rule, design choice, maintenance plan and
        delivery phase below. The 30% advance is fixed by company policy. Budget
        answers never change prices.
      </p>
      <p className="rounded-lg border border-border p-4 text-sm">
        Quotation email:{" "}
        {quotationEmailConfigured()
          ? "Provider credentials are configured. Sender/domain verification and delivery still depend on the provider."
          : "Not configured. Set RESEND_API_KEY and a verified EMAIL_FROM in the server environment. Visitors can still save enquiries and download the PDF."}
      </p>
      <p className="text-sm text-muted-foreground">
        Saving creates a new configuration version automatically. Weeks and
        added module prices are planning assumptions and should be reviewed
        here. Questions use project IDs and optional when/whenFeature
        conditions. Phase shares must total 1. Keep stable IDs when changing
        labels.
      </p>
      <RequirementConfigEditor initial={config} recipients={recipients} />
      <Link href="/tools/cost-calculator" className="underline">
        Open public requirement calculator
      </Link>
    </div>
  );
}
